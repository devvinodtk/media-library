import { goto } from "$app/navigation";
import { generateFolderPaths } from "$lib/utils/utility-functions";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { setContext, getContext } from "svelte";
import JSZip from "jszip";
import pkg from "file-saver";
const { saveAs } = pkg;

interface UserStateProps {
  session: Session | null;
  supabase: SupabaseClient | null;
  user: User | null;
}

type Tags = {
  created_at: string;
  id: number;
  name: string;
  user_id: string;
};

type MediaTypes = {
  created_at: string;
  id: number;
  name: string;
  user_id: string;
};

export type Folder = {
  id: number;
  folder_name: string;
  parent_folder_id: number | null;
  parent_folder_name: string | null;
  media_type_id: number;
  media_type_name: string;
  tag_names: string;
  user_id: string;
  folder_path: string | null;
};

export type Media = {
  created_at: string;
  description: string | null;
  display_name: string;
  folder_id: number;
  id: number;
  name: string;
  thumbnail: string | null;
  user_id: string;
  size: number | null;
};

export type UpdatableMedia = Omit<Media, "id" | "user_id" | "created_at">;

type UpdatableFolder = Omit<
  Folder,
  "id" | "user_id" | "media_type_name" | "parent_folder_name"
>;

export class UserState {
  session = $state<Session | null>(null);
  supabase = $state<SupabaseClient | null>(null);
  user = $state<User | null>(null);
  userName = $state<String | null>(null);
  tags = $state<Tags[] | null>([]);
  mediaTypes = $state<MediaTypes[] | null>([]);
  folders = $state<Folder[] | null>([]);
  media = $state<Media[] | null>([]);

  constructor(data: UserStateProps) {
    this.updateState(data);
  }

  updateState(data: UserStateProps) {
    this.session = data.session;
    this.supabase = data.supabase;
    this.user = data.user;
    this.fetchUserData();
  }

  async fetchUserData() {
    if (!this.user || !this.supabase) {
      return;
    }
    const userId = this.user.id;

    const [userResponse, mediaResponse, mediaTypeResponse, foldersResponse] =
      await Promise.all([
        this.supabase
          .from("user_names")
          .select("name")
          .eq("user_id", userId)
          .single(),
        this.supabase.from("media").select("*").eq("user_id", userId),
        this.supabase.from("media_types").select("*"),
        this.supabase.rpc("folders_media_types_mapping").eq("user_id", userId)
      ]);

    if (
      userResponse.error ||
      mediaResponse.error ||
      mediaTypeResponse.error ||
      foldersResponse.error
    ) {
      console.error("Error fetching user data");
      console.error({
        userError: userResponse.error,
        mediaError: mediaResponse.error,
        mediaTypeError: mediaTypeResponse.error,
        foldersError: foldersResponse.error
      });
      return;
    }

    this.userName = userResponse.data?.name;
    this.media = mediaResponse.data;
    this.mediaTypes = mediaTypeResponse.data;
    if (foldersResponse.data && foldersResponse.data.length) {
      this.folders = generateFolderPaths(foldersResponse.data);
    }
  }

  async uploadMediaAndReturnThumbNailUrl(
    mediaName: string,
    mediaFile: File,
    folderPath: string,
    thumbNail: File
  ) {
    if (!this.supabase || !this.user) {
      return;
    }

    const encodedFileName = encodeURIComponent(
      `${new Date().getTime()}_${mediaName}.${mediaFile.name.split(".").pop()}`
    );
    let filePath = `${this.user.id}/${folderPath}/${encodedFileName}`;
    let thumbNailPath = `${this.user.id}/thumbNails/${folderPath}/${new Date().getTime()}_${thumbNail.name}`;
    let [mediaResponse, thumbNailResponse] = await Promise.all([
      this.supabase.storage.from("media-lib").upload(filePath, mediaFile),
      this.supabase.storage.from("media-lib").upload(thumbNailPath, thumbNail)
    ]);

    if (mediaResponse.error || thumbNailResponse.error) {
      console.error("Error uploading media");
      console.error({
        mediaError: mediaResponse.error,
        thumbNailError: thumbNailResponse.error
      });
      return { status: 400, error: "Error uploading media" };
    }
    const thumbnailUrl = await this.supabase.storage
      .from("media-lib")
      .getPublicUrl(thumbNailPath);

    return { thumbnailUrl, encodedFileName };
  }

  async saveNewMedia(
    mediaFile: File,
    mediaName: string,
    description: string,
    thumbNail: File,
    folderId: number,
    folderPath: string
  ) {
    if (!this.supabase || !this.user) {
      return;
    }
    const uploadResult = await this.uploadMediaAndReturnThumbNailUrl(
      mediaName,
      mediaFile,
      folderPath,
      thumbNail
    );

    if (!uploadResult || uploadResult.status === 400) {
      console.error(uploadResult?.error || "Unknown error uploading media");
      return;
    }

    const { thumbnailUrl, encodedFileName } = uploadResult;

    const response = await this.insertNewMedia({
      name: encodedFileName,
      display_name: mediaName,
      description,
      thumbnail: thumbnailUrl?.data.publicUrl || "",
      folder_id: folderId,
      size: mediaFile.size
    });

    return response;
  }

  async insertNewMedia(insertObject: Partial<Media>) {
    if (!this.supabase || !this.user) {
      return;
    }
    const { status, error } = await this.supabase
      .from("media")
      .insert(insertObject)
      .eq("id", this.user.id);

    if (!error) {
      this.refreshMedia();
    }
    return { status, error };
  }

  async deleteMedia(mediaId: number) {
    if (!this.supabase || !this.user) {
      return;
    }

    const { status, error } = await this.supabase
      .from("media")
      .delete()
      .eq("id", mediaId);

    if (!error) {
      this.refreshMedia();
    }
    return { status, error };
  }

  async deleteFolder(folderId: number) {
    if (!this.supabase || !this.user) {
      return;
    }

    const { status, error } = await this.supabase
      .from("folders")
      .delete()
      .eq("id", folderId);

    if (!error) {
      this.refreshFolders();
    }

    return { status, error };
  }

  async updateMedia(
    mediaId: number,
    updateObject: Partial<UpdatableMedia>,
    mediaFile: File | null,
    thumbnailFile: File | null,
    folderPath: string | null
  ) {
    if (!this.supabase || !this.user) {
      return;
    }

    if (mediaFile && thumbnailFile && updateObject.display_name && folderPath) {
      const uploadResult = await this.uploadMediaAndReturnThumbNailUrl(
        updateObject.display_name,
        mediaFile,
        folderPath,
        thumbnailFile
      );

      if (!uploadResult || uploadResult.status === 400) {
        console.error(uploadResult?.error || "Unknown error uploading media");
        return;
      }

      const { thumbnailUrl, encodedFileName } = uploadResult;

      if (thumbnailUrl && encodedFileName) {
        updateObject.name = encodedFileName;
        updateObject.thumbnail = thumbnailUrl.data.publicUrl;
      }
    }

    const { status, error } = await this.supabase
      .from("media")
      .update(updateObject)
      .eq("id", mediaId);

    if (!error) {
      this.refreshMedia();
    }

    return { status, error };
  }

  async insertNewFolder(insertObject: Partial<UpdatableFolder>) {
    if (!this.supabase || !this.user) {
      return;
    }

    const { status, error } = await this.supabase
      .from("folders")
      .insert(insertObject)
      .eq("id", this.user.id);

    if (!error) {
      this.refreshFolders();
    }

    return { status, error };
  }

  async updateFolder(folderId: number, updateObject: Partial<UpdatableFolder>) {
    if (!this.supabase || !this.user) {
      return;
    }

    const { status, error } = await this.supabase
      .from("folders")
      .update(updateObject)
      .eq("id", folderId);

    if (!error) {
      this.refreshFolders();
    }

    return { status, error };
  }

  async logout() {
    await this.supabase?.auth.signOut();
    goto("/login");
  }

  refreshMedia = async () => {
    if (!this.supabase || !this.user) {
      return;
    }

    const { data, error } = await this.supabase.from("media").select("*");

    if (error) {
      console.log("Error fetching the media:", error.message);
      return;
    }

    this.media = data;
  };

  refreshFolders = async () => {
    if (!this.supabase || !this.user) {
      return;
    }

    const { data, error } = await this.supabase
      .rpc("folders_media_types_mapping")
      .eq("user_id", this.user.id);

    if (data && data.length) {
      this.folders = generateFolderPaths(data);
    }
  };

  getMediaPublicUrl(filePath: string) {
    if (!this.supabase || !this.user) {
      return;
    }

    return this.supabase.storage.from("media-lib").getPublicUrl(filePath);
  }

  downloadMedia = async (filePath: string) => {
    if (!this.supabase || !this.user) {
      return;
    }

    const { data, error } = await this.supabase.storage
      .from("media-lib")
      .download(filePath);

    if (error) {
      console.error(`Error downloading ${filePath}:`, error);
      return null;
    }

    return { data };
  };

  downloadFilesAsZip = async (filePaths: string[]) => {
    const zip = new JSZip();
    const downloadPromises = filePaths.map(async (filePath) => {
      try {
        if (!this.supabase || !this.user) {
          return;
        }
        const { data, error } = await this.supabase.storage
          .from("media-lib")
          .download(filePath);

        if (error) {
          console.error(`Error downloading ${filePath}:`, error);
          return null;
        }

        const fileName = filePath.split("/").pop() || filePath;

        zip.file(fileName, data);

        return { fileName, success: true };
      } catch (e) {
        console.error(`Error processing ${filePath}:`, e);
        return { fileName: filePath, success: false, error: e };
      }
    });

    const results = await Promise.all(downloadPromises);

    const successfulDownloads = results.filter((r) => r && r.success);
    const failedDownloads = results.filter((r) => r && !r.success);

    if (successfulDownloads.length === 0) {
      throw new Error("No files were successfully downloaded");
    }

    if (failedDownloads.length > 0) {
      console.warn(`Failed to download ${failedDownloads.length} files`);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });

    saveAs(zipBlob, `Reports_${new Date().getTime()}`);
  };
}

// Ensure uniqueness of the instance
const USER_STATE_KEY = Symbol("USER_STATE");

export function setUserState(data: UserStateProps) {
  return setContext(USER_STATE_KEY, new UserState(data));
}

export function getUserState() {
  return getContext<ReturnType<typeof setUserState>>(USER_STATE_KEY);
}

import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

interface ReturnObject {
  success: boolean;
  email: string;
  password: string;
  passwordConfirmation?: never;
  name?: never;
  errors: string[];
}

export const actions = {
  default: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const returnObject: ReturnObject = {
      success: true,
      email,
      password,
      errors: []
    };

    if (returnObject.errors.length) {
      returnObject.success = false;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      returnObject.success = false;
      if (error?.message) {
        returnObject.errors.push(error?.message);
      }
      return fail(400, returnObject as any);
    }

    redirect(303, "/private/media");
  }
} satisfies Actions;

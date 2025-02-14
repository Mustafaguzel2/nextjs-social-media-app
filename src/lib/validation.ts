import {z} from "zod";

const requiredString = z.string().trim().min(1, "required");

export const signUpSchema = z.object({
    email: requiredString.email("Invalid email address"),
    username: requiredString.regex(
        /^[a-zA-Z0-9_-]{3,16}$/,
        "Username must be between 3 and 16 characters long and can only contain letters, numbers, hyphens, and underscores."
    ),
    password: requiredString.min(8, "Password must be at least 8 characters long"),
})

export type SignUpValues = z.infer<typeof signUpSchema>

export const loginSchema = z.object({
    username: requiredString,
    password: requiredString,
})

export type LoginValues = z.infer<typeof loginSchema>

export const createPostSchema = z.object({
    content: requiredString,
    mediaIds: z.array(z.string()).max(5, "You can upload a maximum of 5 files"),
})

export const updateUserProfileSchema = z.object({
    displayName: requiredString,
    bio: z.string().max(1000, "Bio must be at most 1000 characters long"),
})
export type UpdateUserProfileValues = z.infer<typeof updateUserProfileSchema>

export const createCommentSchema = z.object({
    content: requiredString,
})
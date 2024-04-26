import { t } from "elysia";

export const LoginUserDTO = t.Object({
    email: t.String({ format: 'email'}),
    password: t.String(),
    rememberme: t.Optional(t.Boolean())
})

export const RegisterUserDTO = t.Object({
    firstname: t.String({error: 'First name not valid'}),
    lastname: t.String(),
    // gender: t.Enum(constants.schemas.gender),
    // phone: t.String({minLength: 9,maxLength: 12}),
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 6, error: 'Password is invalid'}),
    confirmPassword: t.String({minLength: 6})
})

export const changePasswordBody = t.Object({
    oldPassword: t.String({ minLength: 8, error: 'Your old password is required' }),
    newPassword: t.String({ minLength: 8, error: 'New password required too' }),
    confirmPassword: t.String({ minLength: 8 })
})
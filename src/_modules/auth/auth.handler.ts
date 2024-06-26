
import Elysia, { t } from "elysia";
import { AuthController } from ".";
import { LoginUserDTO, RegisterUserDTO, changePasswordBody } from "./auth.models";
import { checkAuth } from "~middleware/authChecks";
import { oauth2 } from "elysia-oauth2";


const authHandler = new Elysia({
    prefix: '/auth',
    detail: { description: 'Authentication endpoints', tags: ['Auth'] }
})

    // OAuth2 plugin
    .use(oauth2({
        Google: [
            Bun.env.GOOGLE_CLIENT_ID ?? '',
            Bun.env.GOOGLE_API_KEY ?? '',
            `http://${Bun.env.HOST ?? ''}:${Bun.env.PORT ?? 80}/v1/auth/login/google/callback`
        ]
    }))


    /* GET */


    .get('/', AuthController.root, {
    })

    .get('/login', AuthController.loginForm)

    .get('/login/google', AuthController.getGoogle)

    .get('/login/google/callback', AuthController.getGoogleCallback)

    .get('/reset-password/:token', AuthController.getResetPassToken, {
        params: t.Object({ token: t.String() }),
        // body: t.Object({ password: t.String() })
    })

    .get('/email-verification/:code', AuthController.getEmailVerificationToken, {
        params: t.Object({ code: t.String() }),
        query: t.Object({ email: t.String({ format: "email", default: "abc@email.com", error: "A valid email address is required"}) }),
    })

    .get('/sessions', AuthController.getAllMySessions, {
        beforeHandle: [checkAuth]
    })


    /* POST */


    .post('/login', AuthController.login, {
        body: LoginUserDTO,
        response: {
            200: t.Object({ data: t.Any(), message: t.String({ default: 'Successfully logged in' }) }),
            400: t.Object({ message: t.String({ default: 'Authentication Error' }) }),
            403: t.Object({ message: t.String({ default: 'User access is revoked.\nReason: ...' }) }),
            404: t.Object({ message: t.String({ default: 'Invalid credentials' }) }),
            406: t.Object({ message: t.String({ default: 'Invalid credentials' }) }),
            500: t.Object({ message: t.String({ default: 'An unknown login error occurred' }) }),
        },
        detail:{
            description: 'Signs in User with previously registered account',
            summary: 'Sign in'
        }
    })

    .post('/register', AuthController.signup, {
        body: RegisterUserDTO,
        response: {
            201: t.Object({ message: t.String({ default: 'Guest Account successfully created (fullname)' }) }),
            400: t.Object({ message: t.String({ default: 'A data persistence problem occurred' }) }),
            406: t.Object({ message: t.String({ default: 'That email address is taken' }) }),
            409: t.Object({ message: t.String({ default: 'That email address is already taken' }) }),
            500: t.Object({ message: t.String({ default: 'An unknown auth error occurred' }) })
        },
        detail:{
            description: 'Creates a new User Account',
            summary: 'Register New User'
        }
    })

    .post('/logout', AuthController.logout, {
        beforeHandle: checkAuth,
        response: {
            200: t.Union([
                t.Object({ message: t.String({ default: 'You successfully logged out'}) }),
                t.Undefined()
            ]),
            401: t.Object({ message: t.String({ default: 'No access token present' }) }),
            405: t.Object({ message: t.String({ default: 'You were not logged in' }) })
        }
    })

    .post('/email-verification', AuthController.postEmailVerification, {
        response: {
            200: t.Object({ message: t.String({ default: 'Verification code sent to user email'}) }),
            500: t.Object({ message: t.String({ default: 'Unable to send verification code'}) }),
        }
    })

    .post('/forgot-password', AuthController.postForgotPassword, {
        body: t.Object({ email: t.String({ format: 'email', default:'abc@email.com' }) })
    })

    .post('/reset-password', AuthController.postResetPass)

    .post('/reset-password/:token', AuthController.postResetPassToken, {
        params: t.Object({ token: t.String() }),
        body: t.Object({ password: t.String(), confirmPassword: t.String() })
    })

    // .post('/resend-verification', AuthController.postEmailVerification, {
    //     response: {
    //         200: t.Object({ message: t.String({ default: 'Verification code sent to user email'}) }),
    //         500: t.Object({ message: t.String({ default: 'Unable to send verification code'}) }),
    //     }
    // })

    .post('/change-password', AuthController.getChangePassword, {
        beforeHandle: checkAuth,
        body: changePasswordBody,
        response: {
            200: t.Union([
                t.Object({ message: t.String({ default: 'Your password was successfully changed' }) }),
                t.Undefined()
            ]),
            400: t.Object({ message: t.String({ default: 'You must be signed in' })}),
            404: t.Object({ message: t.String({ default: 'Your passwords do not match' })}),
            500: t.Object({ message: t.String({ default: 'Unable to change password' })})
        }
    })

export default authHandler;
# steam-openid

### A TypeScript library for integrating Steam OpenID authentication into your application. This library provides an easy-to-use API for handling Steam login and verifying user identities.

# Installation
```sh
npm install steam-openid
```

# Usage
Example with Elysia
```ts
import { SteamAuth } from "openid-steam";
import { Elysia, redirect } from "elysia";

const steam = new SteamAuth(
    "http://localhost:5000", // realm
    "http://localhost:5000/auth/steam/authenticate", // returnUrl
    "YOUR_STEAM_WEBAPI_KEY" // Steam WebAPI key
);

const app = new Elysia();

app.get('/auth/steam', async (ctx) => {
    const redirectUrl = await steam.getDirectUrl();
    if (redirectUrl) return redirect(redirectUrl);
});

app.get('/auth/steam/authenticate', async (ctx) => {
    try {
        const user = await steam.authenticate(new URL(ctx.request.url));
        return user;
    } catch (error) {
        console.error(error);
    }
});
```

# API
```ts
new SteamAuth(realm: string, returnUrl: string, apiKey: string)
```

Creates a new instance of the `SteamAuth` class.

- `realm`: The base URL of your application (e.g., `http://localhost:5000`)
- `returnUrl`: The URL where Steam redirects users after authentication.
- `apiKey`: Your Steam Web API key.

### `steam.getDirectUrl(): Promise<string>`

Returns the Steam OpenID login URL where users should be redirected.

### `steam.authenticate(url: URL): Promise<openid.steam.UserInfo>`
Validates the OpenID response and returns user information.

#### `UserInfo` structure:
```ts
export type UserInfo =
{ 
    _json: ApiUser;
    steamid: string;
    username?: string;
    name?: string;
    profile: {
        url?: string;
        background: {
            static: string | null;
            movie: string | null;
        };
        background_mini: {
            static: string | null;
            movie: string | null;
        };
        avatar: {
            small?: string;
            medium?: string;
            large?: string;
            animated: {
                static: string | null;
                movie: string | null;
            };
            frame: {
                static: string | null;
                movie: string | null;
            }
        };
    } 
}
```

## Credits
This library was inspired by and takes much of its implementation from [node-steam-openid](https://www.npmjs.com/package/node-steam-openid).
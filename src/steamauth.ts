

import { RelyingParty } from "openid";
import type { openid } from "./api";

const OPENID_DATA =
{
    ns: "http://specs.openid.net/auth/2.0",
    op_endpoint: "https://steamcommunity.com/openid/login",
    claimed_id: "https://steamcommunity.com/openid/id/",
    identity: "https://steamcommunity.com/openid/id/"
};

export class SteamAuth
{
    private realm: string;
    private returnUrl: string;
    private apiKey: string;
    private relyingParty: RelyingParty;

    constructor(realm: string, returnUrl: string, apiKey: string)
    {
        this.realm = realm;
        this.returnUrl = returnUrl;
        this.apiKey = apiKey;

        this.relyingParty = new RelyingParty(
            this.returnUrl,
            this.realm,
            true,
            true,
            []
        );
    }

    async getDirectUrl(): Promise<string | null>
    {
        return new Promise((resolve, reject) => {
            this.relyingParty.authenticate(
                "https://steamcommunity.com/openid",
                false,
                (error, authUrl) => {
                    if(error) return reject(error);
                    if(!authUrl) return reject("Authentication failed");

                    resolve(authUrl);
                }
            )
        });
    }

    async fetchIdentifier(steamOpenId: string): Promise<openid.steam.UserInfo | null>
    {
        return new Promise(async (resolve, reject) => {
            const steamId = steamOpenId.replace(OPENID_DATA.identity, "");

            try
            {
                const data = await this.fetchApi(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.apiKey}&steamids=${steamId}`) as openid.steam.ApiUsers | null;
                if(!data || !data.response) return reject("Failed to find player!");

                const { players } = data.response;

                if(players && players.length > 0)
                {
                    const player = players[0]!;

                    const profileItems = await this.fetchApi(`https://api.steampowered.com/IPlayerService/GetProfileItemsEquipped/v1/?steamid=${player.steamid}`) as openid.steam.ApiProfileItems | null;
                    if(!profileItems) return reject("Failed to find profile items for: " + player.steamid);

                    const {
                        avatar_frame,
                        animated_avatar,
                        profile_background,
                        mini_profile_background
                    } = profileItems.response;

                    const cdnUrl = "https://cdn.akamai.steamstatic.com/steamcommunity/public/images";

                    resolve({
                        _json: player,
                        steamid: steamId,
                        username: player.personaname,
                        name: player.realname,
                        profile: {
                            url: player.profileurl,
                            background: {
                                static: profile_background?.image_large ? `${cdnUrl}/${profile_background?.image_large}` : null,
                                movie: profile_background?.movie_webm ? `${cdnUrl}/${profile_background?.movie_webm}` : null,
                            },
                            background_mini: {
                                static: mini_profile_background?.image_large ? `${cdnUrl}/${mini_profile_background?.image_large}` : null,
                                movie: mini_profile_background?.movie_webm ? `${cdnUrl}/${mini_profile_background?.movie_webm}` : null,
                            },
                            avatar: {
                                small: player.avatar,
                                medium: player.avatarmedium,
                                large: player.avatarfull,
                                animated: {
                                    static: animated_avatar?.image_large ? `${cdnUrl}/${animated_avatar?.image_large}` : player.avatarfull ?? null,
                                    movie: animated_avatar?.image_small ? `${cdnUrl}/${animated_avatar?.image_small}` : player.avatarfull ?? null,
                                },
                                frame: {
                                    static: avatar_frame?.image_large ? `${cdnUrl}/${avatar_frame?.image_large}` : null,
                                    movie: avatar_frame?.image_small ? `${cdnUrl}/${avatar_frame?.image_small}` : null
                                }
                            }
                        }
                    });
                }
            }
            catch(error)
            {
                reject("Steam server error: " + error);
            }
        });
    }

    async authenticate(url: URL): Promise<openid.steam.UserInfo | null>
    {
        return new Promise((resolve, reject) => {
            const searchParams = url.searchParams;
            if(!searchParams) return reject("Failed to parse query params");

            const ns = searchParams.get('openid.ns');
            const endpoint = searchParams.get('openid.op_endpoint');
            const claimed_id = searchParams.get('openid.claimed_id') as string | undefined;
            const identity = searchParams.get('openid.identity') as string | undefined;

            if(ns !== OPENID_DATA.ns) return reject("Claimed identity is not valid");
            if(endpoint !== OPENID_DATA.op_endpoint) return reject("Claimed identity is not valid");
            if(claimed_id?.startsWith(OPENID_DATA.claimed_id) !== true) return reject("Claimed identity is not valid");
            if(identity?.startsWith(OPENID_DATA.identity) !== true) return reject("Claimed identity is not valid");

            this.relyingParty.verifyAssertion(url.toString(), async (error, result) => {
                if(error) return reject(error);
                if(!result || !result.authenticated || !result.claimedIdentifier)
                {
                    return reject("Failed to authenticate user!");
                }

                if(/^https?:\/\/steamcommunity\.com\/openid\/id\/\d+$/.test(result.claimedIdentifier) !== true)
                {
                    return reject("Claimed identity is not valid");
                }

                try
                {
                    const user = await this.fetchIdentifier(result.claimedIdentifier);

                    return resolve(user);
                }
                catch(error)
                {
                    return reject(error);
                }
            });
        });
    }

    protected parseQuery(url: URL)
    {
        const queryParams: Record<string, string | string[]> = {};

        url.searchParams.forEach((value, key) => {
            if(queryParams[key])
            {
                if(Array.isArray(queryParams[key]))
                {
                    (queryParams[key] as string[]).push(value);
                }
                else
                {
                    queryParams[key] = [queryParams[key] as string, value];
                }
            }
            else
            {
                queryParams[key] = value;
            }
        });

        return queryParams;
    }

    protected async fetchApi(url: string): Promise<unknown | null>
    {
        const req = await fetch(url);
        if(req.ok)
        {
            return req.json();
        }

        return null;
    }
}
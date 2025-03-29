export namespace openid
{
    export namespace steam 
    {
        export type ApiUser =
        {
            steamid?: string;
            communityvisibilitystate?: number;
            profilestate?: number;
            personaname?: string;
            commentpermission?: number;

            profileurl?: string;
            avatar?: string;
            avatarmedium?: string;
            avatarfull?: string;
            avatarhash?: string;

            lastlogoff?: number;
            personastate?: number;
            primaryclanid?: string;
            timecreated?: number;
            personastateflags?: number;
            realname?: string;
            gameid?: string;
            gameserverip?: string;
            gameextrainfo?: string;
            cityid?: string;
            loccountrycode?: string;
            locstatecode?: string;
            loccityid?: string;
        };

        export type ApiUsers =
        {
            response: {
                players: ApiUser[]
            }   
        };

        export type ApiProfileItems =
        {
            response: {
                profile_background?: {
                    communityitemid?: string;
                    image_large?: string;
                    name?: string;
                    item_title?: string;
                    item_description?: string;
                    appid?: number;
                    item_type?: number;
                    item_class?: number;
                    movie_webm?: string;
                    movie_mp4?: string;
                    movie_webm_small?: string;
                    movie_mp4_small?: string;
                },
                mini_profile_background?: {
                    communityitemid?: string;
                    image_large?: string;
                    name?: string;
                    item_title?: string;
                    item_description?: string;
                    appid?: number;
                    item_type?: number;
                    item_class?: number;
                    movie_webm?: string;
                    movie_mp4?: string;
                    movie_webm_small?: string;
                    movie_mp4_small?: string;
                },
                avatar_frame?: {
                    communityitemid?: string;
                    image_large?: string;
                    image_small?: string;
                    name?: string;
                    item_title?: string;
                    item_description?: string;
                    appid?: number;
                    item_type?: number;
                    item_class?: number;
                    movie_webm?: string;
                    movie_mp4?: string;
                    movie_webm_small?: string;
                    movie_mp4_small?: string;
                },
                animated_avatar?: {
                    image_large?: string;
                    image_small?: string;
                    [key: string]: unknown;
                };
                profile_modifier?: object;
                steam_deck_keyboard_skin?: object;
            }
        };

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
        };
    }
}
import {FilterQuery, UpdateQuery} from 'mongoose'
import Session, {SessionDocument} from "../model/session.model";
import {LeanDocument} from 'mongoose'
import {UserDocument} from "../model/user.model";
import config from 'config'
import {decode, sign} from "../utils/jwt.utils";
import {get} from 'lodash'
import {findUser} from "./user.service";

export async function createSession(userId: string, userAgent: string) {
    const session = await Session.create({user: userId, userAgent})
    return session.toJSON();
}

export function createAccessToken({user, session}: {
    user:
        | Omit<UserDocument, "password">
        | LeanDocument<Omit<UserDocument, "password">>;
    session:
        | Omit<SessionDocument, "password">
        | LeanDocument<Omit<SessionDocument, "password">>;
}) {
    return sign(
        {...user, session: session._id},
        {expiresIn: config.get('accessTokenTtl')});
}

export async function reIssueAccessToken({refreshToken}: {refreshToken: string}) {
    // decode the refresh token
    const {decoded} = decode(refreshToken)
    if (!decoded || !get(decoded, "_id")) return false;

    // get the session
    const session = await Session.findById(get(decoded, '_id'))

    // make sure the session is still valid
    if (!session || !session?.valid) return false;

    const user = await findUser({_id: session.user});

    if (!user) return false;

    return createAccessToken({user, session})

}


export async function updateSession(
    query: FilterQuery<SessionDocument>,
    update: UpdateQuery<SessionDocument>
) {
    return Session.updateOne(query, update);
}

export async function findSessions(query: FilterQuery<SessionDocument>) {
    return Session.find(query).lean();
}

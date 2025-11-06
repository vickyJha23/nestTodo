
export const accessCookieOptions = {
     httpOnly: true,
     secure: false,
     sameSite: "lax",
     maxAge:  24 * 60 * 60 * 1000 
}

export const refreshCookieOptins = {
     httpOnly: true,
     secure: false,
     sameSite: "lax",
     maxAge: 7 * 24 * 60 * 60 * 1000
}
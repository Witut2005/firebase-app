
import { User } from "firebase/auth";


let currentUser: User | null = null;


export function userGet(): User | null
{
    return currentUser;
}

export function userSet(userData: User): void 
{
    currentUser = userData;
}

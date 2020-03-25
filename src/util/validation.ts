export class Validation {
    validateUser(userInformation: any) {
        return userInformation.name && userInformation.password && userInformation.email;
    }
}
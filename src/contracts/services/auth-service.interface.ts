import { Profile } from 'passport';
import { DeleteResult } from 'typeorm';
import { AuthUserResponse } from '~/graphql/types/dtos/authentication/auth-user-response.dto';
import { CredentialsTakenError } from '~/graphql/types/dtos/authentication/credentials-taken-error.dto';
import { InvalidCredentialsError } from '~/graphql/types/dtos/authentication/invalid-credentials-error.dto';
import { RegisterUserInput } from '~/graphql/types/dtos/authentication/register-user.input';
import { SignOutUserInput } from '~/graphql/types/dtos/authentication/signout-user-input.dto';
import { ErrorResponse } from '~/graphql/types/dtos/error-response.interface';
import { SocialProviderTypes } from '~/models/social-provider.model';
import { User } from '~/models/user.model';
import { Either } from '~/utils/tools/either';

export interface IAuthService {
  registerUser(
    user: RegisterUserInput,
  ): Promise<Either<CredentialsTakenError, User>>;

  signTokens(user: User): Promise<AuthUserResponse>;

  validateCredentials(
    email: string,
    password: string,
  ): Promise<Either<InvalidCredentialsError, User>>;

  changeUserPassword(user: User, newPassword: string): Promise<User | null>;

  signOutUser(signOutUserInput: SignOutUserInput): Promise<DeleteResult>;

  registerExternalUser(
    profile: Profile,
    username: string,
    provider: SocialProviderTypes,
  ): Promise<Either<ErrorResponse, User>>;
}

export const IAuthService = Symbol('IAuthService');

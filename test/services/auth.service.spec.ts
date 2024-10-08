import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Profile } from 'passport';
import { UserDto } from '~/common/dtos/user-dtos/user.dto';
import { ISocialProviderRepository } from '~/contracts/repositories/social-provider-repository.interface';
import { ITokenRepository } from '~/contracts/repositories/token-repository.interface';
import { IAuthService } from '~/contracts/services/auth-service.interface';
import { IUserService } from '~/contracts/services/user-service.interface';
import { AuthUserResponse } from '~/graphql/types/dtos/authentication/auth-user-response.dto';
import { CredentialsTakenError } from '~/graphql/types/dtos/authentication/credentials-taken-error.dto';
import { InvalidCredentialsError } from '~/graphql/types/dtos/authentication/invalid-credentials-error.dto';
import { RegisterUserInput } from '~/graphql/types/dtos/authentication/register-user.input';
import { SocialAlreadyAssignedError } from '~/graphql/types/dtos/authentication/social-already-assigned-error.dto';
import { SocialProvider, SocialProviderTypes } from '~/models/social-provider.model';
import { Token } from '~/models/token.model';
import { User } from '~/models/user.model';
import { AuthService } from '~/services/auth.service';
import { either } from '~/utils/tools/either';

describe('AuthService', () => {
  let service: IAuthService;

  const user: Partial<User> = {
    id: 'id',
    email: 'test@gmail.com',
    displayName: 'displayName',
    userName: 'userName',
  };

  const mockTokenRepo = {
    save: jest.fn(),
  };

  const mockUserService = {
    existsByCredentials: jest.fn(),
    createUser: jest.fn(),
    getUserByConditions: jest.fn(),
    saveProviderAndUser: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    sign: jest.fn(),
  };

  const mockSocialProviderRepository = {
    findByCondition: jest.fn(),

  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: IAuthService,
          useClass: AuthService,
        },
        {
          provide: IUserService,
          useValue: mockUserService,
        },
        {
          provide: ITokenRepository,
          useValue: mockTokenRepo,
        },
        {
          provide: ISocialProviderRepository,
          useValue: mockSocialProviderRepository,
        },
      ],
    })
      .useMocker((token) => {
        return jest.fn();
      })
      .compile();

    service = module.get<IAuthService>(IAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('registerUser should return CredentialsTakenError', async () => {
    // arrange
    const registerUserInput: RegisterUserInput = {
      email: 'test@gmail.com',
      password: '123456',
    };
    mockUserService.existsByCredentials.mockResolvedValue(true);

    // act
    const result = await service.registerUser(registerUserInput);

    // assert
    expect(result).toEqual(
      either.error(
        new CredentialsTakenError({
          providedEmail: registerUserInput.email,
        }),
      ),
    );
  });

  it('registerUser should return user', async () => {
    // arrange
    const registerUserInput: RegisterUserInput = {
      email: 'test@gmail.com',
      password: '123456',
    };
    mockUserService.existsByCredentials.mockResolvedValue(false);
    mockUserService.createUser.mockResolvedValue(user);

    // act
    const result = await service.registerUser(registerUserInput);

    // assert
    expect(result).toEqual(either.of(user));
  });

  it('signTokens should return AuthUserResponse', async () => {
    // arrange
    mockJwtService.signAsync.mockResolvedValue('refreshToken');
    mockJwtService.sign.mockReturnValue('accessToken');
    mockTokenRepo.save.mockResolvedValue(new Token());

    // act
    const result = await service.signTokens(user as User);

    // assert
    expect(result).toEqual(
      new AuthUserResponse({
        user: user as UserDto,
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
      }),
    );
  });

  it('validateCredentials should return InvalidCredentialsError', async () => {
    // arrange
    mockUserService.getUserByConditions.mockResolvedValue(null);

    // act
    const result = await service.validateCredentials('email', 'password');

    // assert
    expect(result).toEqual(
      either.error(
        new InvalidCredentialsError({
          providedEmail: 'email',
        }),
      ),
    );
  });

  it('validateCredentials should return InvalidCredentialsError', async () => {
    // arrange
    user.comparePassword = async () => false;
    mockUserService.getUserByConditions.mockResolvedValue(user);

    // act
    const result = await service.validateCredentials('email', 'password');

    // assert
    expect(result).toEqual(
      either.error(
        new InvalidCredentialsError({
          providedEmail: 'email',
        }),
      ),
    );
  });

  it('validateCredentials should return User', async () => {
    // arrange
    user.comparePassword = async () => true;
    mockUserService.getUserByConditions.mockResolvedValue(user);

    // act
    const result = await service.validateCredentials('email', 'password');

    // assert
    expect(result).toEqual(either.of(user));
  });

  it('registerExternalUser should return ErrorResponse v1', async () => {
    // arrange
    const profile: Profile = {
      displayName: 'displayName',
      provider: 'google',
      id: 'id',
      emails: [{ value: 'test@gmail.com' }]
    };
    const username: string = 'username';
    const provider: SocialProviderTypes = SocialProviderTypes.GOOGLE;
    mockSocialProviderRepository.findByCondition.mockResolvedValue({
      id: 'id',
      provider: SocialProviderTypes.GOOGLE,
      socialId: 'socialId'
    } as SocialProvider)

    // act
    const result = await service.registerExternalUser(profile, username, provider);

    // assert
    expect(result).toEqual(either.error(
      new SocialAlreadyAssignedError({
        provider,
      }),
    ));

  });

  it('registerExternalUser should return ErrorResponse v2', async () => {
    // arrange
    const profile: Profile = {
      displayName: 'displayName',
      provider: 'google',
      id: 'id',
      emails: [{ value: 'test@gmail.com' }]
    };
    const username: string = 'username';
    const provider: SocialProviderTypes = SocialProviderTypes.GOOGLE;
    mockSocialProviderRepository.findByCondition.mockResolvedValue(null)
    mockUserService.existsByCredentials.mockResolvedValue(true);

    // act
    const result = await service.registerExternalUser(profile, username, provider);

    // assert
    expect(result).toEqual(either.error(
      new CredentialsTakenError({
        providedEmail: profile?.emails ? profile?.emails[0].value : '',
        providedUsername: username,
      }),
    ));

  });

  it('registerExternalUser should return User', async () => {
    // arrange
    const profile: Profile = {
      displayName: 'displayName',
      provider: 'google',
      id: 'id',
      emails: [{ value: 'test@gmail.com' }]
    };
    const username: string = 'username';
    const provider: SocialProviderTypes = SocialProviderTypes.GOOGLE;
    mockSocialProviderRepository.findByCondition.mockResolvedValue(null)
    mockUserService.existsByCredentials.mockResolvedValue(false);
    mockUserService.saveProviderAndUser.mockResolvedValue(user);

    // act
    const result = await service.registerExternalUser(profile, username, provider);

    // assert
    expect(result).toEqual(either.of(user));
  });
});

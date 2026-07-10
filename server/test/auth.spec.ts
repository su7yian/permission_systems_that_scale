import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { SigninDto } from "../src/auth/dto/signin.dto";
import { SignupDto } from "../src/auth/dto/signup.dto";

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);
    await prisma.CleanDb();
    pactum.request.setBaseUrl('http://localhost:3000');
  });
  afterAll(async () => {
    await app.close(); 
  }, 10000);


   describe('Auth', () => {
    const email = 'sufy@gmail.com';
    const password = '123';
    const newPassword = '456';
    const signupDto: SignupDto = {
      email,
      password,
      name: 'John Doe',
      role: 'admin',
      department: 'martech',
    };
    const signinDto: SigninDto = { email, password };


    describe('Signup and Signout', () => {
      it('should signup and access the profile with the generated tokens', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(signupDto)
          .expectStatus(201)
          .stores('access_token', 'access_token')
      });
      it('should invalidate the signups access and refresh tokens', async () => {
        await pactum
          .spec()
          .get('/auth/signout')
          .withBearerToken('$S{access_token}')
          .expectStatus(200)
          .expectBodyContains(true)
    });
    });

    describe('Signin multiple sessions', () => {
      it('should signin, return tokens for session 1', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(signinDto)
          .expectStatus(200)
          .stores('s1_access_token', 'access_token')
          .stores('s1_refresh_token', 'refresh_token')
      });
       it('should signin, return tokens for session 2', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(signinDto)
          .expectStatus(200)
          .stores('s2_access_token', 'access_token')
          .stores('s2_refresh_token', 'refresh_token')
      });
    });

// Token rotation invalidates the old tokens for the current session, while the other session remains valid.
    describe('Refresh', () => {
      it('should rotate tokens', async () => {
        await pactum
          .spec()
          .post('/auth/refresh')
          .withBearerToken('$S{s1_refresh_token}')
          .expectStatus(201)
          .stores('s1_new_access_token', 'access_token')
          .stores('s1_new_refresh_token', 'refresh_token')
      });
          // Test with an expired token
      it('should invalidate the session 1s access and refresh tokens', async () => {
        await pactum
          .spec()
          .post('/auth/refresh')
          .withBearerToken('$S{s1_refresh_token}')
          .expectStatus(401)
      });
      // Test if other session's tokens are still valid
      it(' should NOT invalidate the other session 2s access and refresh tokens', async () => {
        return pactum
              .spec()
              .post('/auth/refresh')
              .withBearerToken('$S{s2_refresh_token}')
              .expectStatus(201)
              .stores('s2_new_access_token', 'access_token')
              .stores('s2_new_refresh_token', 'refresh_token')
            });
    });
// Invalidate tokens of all sessions after password change
    describe('Password change', () => {
      it('should change the password and invalidate all old tokens', async () => {
        await pactum
          .spec()
          .patch('/user/password')
          .withBearerToken('$S{s1_new_access_token}')
          .withBody({ old_password: password, new_password: newPassword })
          .expectStatus(200)
      });

// Invalidate tokens after password change
      it('should also invalidate refresh token of current session', async () => {
              await pactum
              .spec()
              .post('/auth/refresh')
              .withBearerToken('$S{s1_new_refresh_token}')
              .expectStatus(401)
      });
      it('should also invalidate access tokens of current session', async () => {
              await pactum
              .spec()
              .get('/auth/signout')
              .withBearerToken('$S{s1_new_access_token}')
              .expectStatus(401)
              .inspect();
      });

// Invalidate tokens of other sessions after password change
      it('should also invalidate other sessions refresh token', async () => {
              await pactum
              .spec()
              .post('/auth/refresh')
              .withBearerToken('$S{s2_new_refresh_token}')
              .expectStatus(401)
      });
     it('should also invalidate other sessions access token', async () => {
              await pactum
              .spec()
              .get('/auth/signout')
              .withBearerToken('$S{s2_new_access_token}')
              .expectStatus(401)
      });
    });
   
  });
});

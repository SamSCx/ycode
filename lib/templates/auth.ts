/**
 * Authentication Elements Templates
 */

import { BlockTemplate } from '@/types';

export const authTemplates: Record<string, BlockTemplate> = {
  authLogin: {
    icon: 'log-in',
    name: 'Login Form',
    template: {
      name: 'authLogin',
      classes: ['w-full', 'max-w-md', 'mx-auto'],
      settings: {
        auth: {
          redirectUrl: '/',
          showGoogle: true,
          showGithub: false,
        }
      }
    }
  },
  authRegister: {
    icon: 'user-plus',
    name: 'Register Form',
    template: {
      name: 'authRegister',
      classes: ['w-full', 'max-w-md', 'mx-auto'],
      settings: {
        auth: {
          redirectUrl: '/',
          showGoogle: true,
          showGithub: false,
        }
      }
    }
  },
  authForgotPassword: {
    icon: 'key',
    name: 'Forgot Password',
    template: {
      name: 'authForgotPassword',
      classes: ['w-full', 'max-w-md', 'mx-auto'],
      settings: {}
    }
  }
};

export const errorMessages = {
  MISSING_ACCESS_TOKEN: 'Please log in to access this feature. Click the login button to sign in.',
  INVALID_ACCESS_TOKEN: 'Your session has expired. Please log in again to continue using the application.',

  USER_NAME_ALREADY_EXISTS: 'This username is already taken. Please choose a different username.',
  USER_EMAIL_ALREADY_EXISTS: 'This email is already registered. Please use a different email or try logging in.',
  INVALID_PASSWORD: 'Invalid login or password. Please check your credentials and try again.',
  USER_LOGIN_NOT_FOUND:
    'The email address you entered is not registered. Please check your email or sign up for a new account.',
  FAIL_GET_CURRENT_USER: 'Failed to get current user information. Please try refreshing the page.',
  FAIL_GET_USER_BY_ID: 'Failed to get user information. Please try again later.',
  FAIL_GET_USERS: 'Failed to get users list. Please refresh the page to try again.',
  FAIL_GET_USERS_SEARCH: 'Failed to search users. Please try a different search term.',
  FAIL_ADD_USER_TO_GAME:
    'Failed to add user to the game. Please try again or check if the user is already in the game.',

  FAIL_ACCESS_TOKEN_PARSE: 'Failed to process access token. Please log out and log in again.',
  FAIL_REFRESH_TOKEN_PARSE: 'Failed to process refresh token. Please log out and log in again.',
  FAIL_GENERATE_TOKENS: 'Failed to generate authentication tokens. Please try logging in again.',

  INVALID_REQUEST_BODY: 'Invalid request data provided. Please check your input and try again.',

  FAIL_HASH_PASSWORD: 'Failed to process password. Please try again or contact support if the issue persists.',
  FAIL_PASSWORD_COMPARE: 'Failed to verify password. Please check your credentials and try again.',

  FAIL_MAP_GAME_TEMPLATE_CLIENT_TO_DB: 'Failed to process game template data. Please try again or contact support.',
  FAIL_CREATE_GAME_TEMPLATE: 'Failed to create game template. Please check your input and try again.',
  FAIL_GET_GAME_TEMPLATE_BY_ID: 'Failed to get game template. Please try refreshing the page.',
  FAIL_GET_GAME_TEMPLATES: 'Failed to get game templates. Please try refreshing the page.',
  FAIL_GET_PUBLIC_GAME_TEMPLATES: 'Failed to get public game templates. Please try refreshing the page.',
  FAIL_GET_GAME_TEMPLATES_BY_CREATOR_ID: 'Failed to get your game templates. Please try refreshing the page.',
  FAIL_GET_GAME_TEMPLATE_INFO: 'Failed to get game template information. Please try refreshing the page.',
  FAIL_SEARCH_GAME_TEMPLATES: 'Failed to search game templates. Please try a different search term.',
  FAIL_UPDATE_GAME_TEMPLATE: 'Failed to update game template. Please check your changes and try again.',
  FAIL_DELETE_GAME_TEMPLATE: 'Failed to delete game template. Please try again or contact support.',

  FAIL_MAP_GAME_CLIENT_TO_DB: 'Failed to process game data. Please try again or contact support.',
  FAIL_CREATE_GAME: 'Failed to create game. Please check your input and try again.',
  FAIL_GET_GAME_BY_ID: 'Failed to get game information. Please try refreshing the page.',
  FAIL_GET_PENDING_USERS_BY_GAME_ID: 'Failed to get pending users. Please try refreshing the page.',
  FAIL_GET_ACTIVE_GAMES: 'Failed to get active games. Please try refreshing the page.',
  FAIL_GET_FINISHED_GAMES: 'Failed to get finished games. Please try refreshing the page.',
  FAIL_REMOVE_USER_FROM_GAME: 'Failed to remove user from game. Please try again or contact support.',
  FAIL_GET_GAME_INVITES: 'Failed to get game invites. Please try refreshing the page.',
  FAIL_ACCEPT_GAME_INVITE: 'Failed to accept game invite. Please try again or contact support.',
  FAIL_DECLINE_GAME_INVITE: 'Failed to decline game invite. Please try again or contact support.',
  FAIL_DELETE_GAME: 'Failed to delete game. Please try again or contact support.',
  FAIL_FINISH_GAME: 'Failed to finish game. Please try again or contact support.',
  FAIL_UPDATE_GAME: 'Failed to update game. Please check your changes and try again.',

  VALIDATION_PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  VALIDATION_USERNAME_TOO_LONG: 'Username must be less than 32 characters long.',
  VALIDATION_USERNAME_TOO_SHORT: 'Username must be at least 2 characters long.',
  VALIDATION_INVALID_EMAIL: 'Please enter a valid email address (e.g., user@example.com).',
} as const

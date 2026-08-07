export const ErrorCode = {
  authRequired: "AUTH_REQUIRED",
  authTokenInvalid: "AUTH_TOKEN_INVALID",
  authUserNotFound: "AUTH_USER_NOT_FOUND",
  authCredentialsRequired: "AUTH_CREDENTIALS_REQUIRED",
  authInvalidCredentials: "AUTH_INVALID_CREDENTIALS",

  registerFieldsRequired: "REGISTER_FIELDS_REQUIRED",
  registerPasswordInvalid: "REGISTER_PASSWORD_INVALID",
  registerKeyInvalidOrExhausted: "REGISTER_KEY_INVALID_OR_EXHAUSTED",
  registerEmailNotEligible: "REGISTER_EMAIL_NOT_ELIGIBLE",
  registerEmailAlreadyRegistered: "REGISTER_EMAIL_ALREADY_REGISTERED",
  registerKeyJustExhausted: "REGISTER_KEY_JUST_EXHAUSTED",

  passwordChangeUnauthorized: "PASSWORD_CHANGE_UNAUTHORIZED",
  passwordChangeFieldsRequired: "PASSWORD_CHANGE_FIELDS_REQUIRED",
  passwordChangePasswordInvalid: "PASSWORD_CHANGE_PASSWORD_INVALID",
  passwordChangeCurrentInvalid: "PASSWORD_CHANGE_CURRENT_INVALID",

  boardNameRequired: "BOARD_NAME_REQUIRED",
  boardNotFound: "BOARD_NOT_FOUND",
  boardDeleteForbidden: "BOARD_DELETE_FORBIDDEN",
  boardSharedSuffixRequired: "BOARD_SHARED_SUFFIX_REQUIRED",
  boardNotShared: "BOARD_NOT_SHARED",

  listNameRequired: "LIST_NAME_REQUIRED",
  listNotFound: "LIST_NOT_FOUND",

  cardTitleRequired: "CARD_TITLE_REQUIRED",
  cardNotFound: "CARD_NOT_FOUND",
  cardListNotFound: "CARD_LIST_NOT_FOUND",
  cardMemberOutsideBoard: "CARD_MEMBER_OUTSIDE_BOARD",

  memberUserNotFound: "MEMBER_USER_NOT_FOUND",
  memberSelfAddForbidden: "MEMBER_SELF_ADD_FORBIDDEN",
  memberAlreadyExists: "MEMBER_ALREADY_EXISTS",
  memberNotFound: "MEMBER_NOT_FOUND",
  memberAddForbidden: "MEMBER_ADD_FORBIDDEN",
  memberRemoveForbidden: "MEMBER_REMOVE_FORBIDDEN",

  serviceUnderPressure: "SERVICE_UNDER_PRESSURE",
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface ApiErrorBody {
  error_code: ErrorCodeValue;
  detail: string;
}

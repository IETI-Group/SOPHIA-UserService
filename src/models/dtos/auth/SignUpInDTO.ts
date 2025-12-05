interface SignUpInDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string; // Format: YYYY-MM-DD
}

export type { SignUpInDTO };
export default SignUpInDTO;

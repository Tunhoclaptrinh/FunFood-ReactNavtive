export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const getValidationError = (field: string, value: any): string | null => {
  switch (field) {
    case "email":
      return validateEmail(value) ? null : "Invalid email format";
    case "phone":
      return validatePhoneNumber(value) ? null : "Invalid phone number";
    case "password":
      return validatePassword(value) ? null : "Password must be at least 6 characters";
    case "name":
      return validateName(value) ? null : "Name must be at least 2 characters";
    default:
      return null;
  }
};

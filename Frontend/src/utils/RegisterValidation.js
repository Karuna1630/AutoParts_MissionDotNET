import * as Yup from 'yup';

const phoneRegExp = /^\+?[0-9\s-]{7,20}$/;

export const registerValidationSchema = Yup.object({
	fullName: Yup.string()
		.trim()
		.min(3, 'Full name must be at least 3 characters')
		.max(60, 'Full name must be 60 characters or less')
		.required('Full name is required'),
	email: Yup.string()
		.trim()
		.email('Please enter a valid email address')
		.required('Email is required'),
	phone: Yup.string()
		.trim()
		.matches(phoneRegExp, 'Please enter a valid phone number')
		.required('Phone number is required'),
	password: Yup.string()
		.min(8, 'Password must be at least 8 characters')
		.matches(/[a-z]/, 'Password must include at least one lowercase letter')
		.matches(/[A-Z]/, 'Password must include at least one uppercase letter')
		.matches(/[0-9]/, 'Password must include at least one number')
		.required('Password is required'),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref('password')], 'Passwords must match')
		.required('Confirm password is required'),
});

export default registerValidationSchema;

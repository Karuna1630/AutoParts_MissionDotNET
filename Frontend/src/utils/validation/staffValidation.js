import * as Yup from 'yup';

const phoneRegExp = /^[0-9]{10}$/;

export const staffValidationSchema = Yup.object().shape({
  firstName: Yup.string().min(2, 'First name too short').max(50).required('First name is required'),
  lastName: Yup.string().min(2, 'Last name too short').max(50).required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phoneNumber: Yup.string()
    .matches(phoneRegExp, 'Phone must be 10 digits')
    .required('Phone number is required'),
  role: Yup.string().oneOf(['STAFF', 'ADMIN']).required('Role is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export default staffValidationSchema;

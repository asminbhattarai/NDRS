import { z } from 'zod';

const districts = [
  'Achham', 'Arghakhanchi', 'Baglung', 'Baitadi', 'Bajhang', 'Bajura', 'Banke',
  'Bara', 'Bardiya', 'Bhaktapur', 'Bhojpur', 'Chitwan', 'Dadeldhura', 'Dailekh',
  'Dang', 'Darchula', 'Dhading', 'Dhankuta', 'Dhanusa', 'Dolakha', 'Dolpa',
  'Doti', 'Gorkha', 'Gulmi', 'Humla', 'Ilam', 'Jajarkot', 'Jhapa', 'Jumla',
  'Kailali', 'Kalikot', 'Kanchanpur', 'Kapilvastu', 'Kaski', 'Kathmandu',
  'Kavrepalanchok', 'Khotang', 'Lalitpur', 'Lamjung', 'Mahottari', 'Makwanpur',
  'Manang', 'Morang', 'Mugu', 'Mustang', 'Myagdi', 'Nawalparasi', 'Nuwakot',
  'Okhaldhunga', 'Palpa', 'Panchthar', 'Parbat', 'Parsa', 'Pyuthan',
  'Ramechhap', 'Rasuwa', 'Rautahat', 'Rolpa', 'Rukum', 'Rupandehi', 'Salyan',
  'Sankhuwasabha', 'Saptari', 'Sarlahi', 'Sindhuli', 'Sindhupalchok',
  'Siraha', 'Solukhumbu', 'Sunsari', 'Surkhet', 'Syangja', 'Tanahu',
  'Taplejung', 'Terhathum', 'Udayapur'
];

export const validateRegistration = (data) => {
  const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    firstName: z.string().min(2, 'First name is required'),
    middleName: z.string().optional(),
    lastName: z.string().min(2, 'Last name is required'),
    phoneNumber: z.string()
      .regex(/^(\+977)?[9][6-9]\d{8}$/, 'Invalid Nepali phone number'),
    address: z.string().min(5, 'Address is required'),
    district: z.enum(districts, {
      errorMap: () => ({ message: 'Please select a valid district' })
    }),
    userType: z.enum(['citizen', 'government_official'], {
      errorMap: () => ({ message: 'Invalid user type' })
    })
  });

  return schema.safeParse(data);
};

export const validateLogin = (data) => {
  const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  });

  return schema.safeParse(data);
};
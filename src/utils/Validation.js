// utils/validation.js
export const validatePhoneAndPostalCode = (phone, postalCode, setPhoneNumberError, setPostalCodeError, setPhone, setPostalCode) => {
    const trimmedPhoneNumber = phone ? phone.trim() : '';
    const trimmedPostalCode = postalCode.trim();
    let isValid = true;


    // Validate phone number
    if (trimmedPhoneNumber !== '' && !/^\+?\d+(?:\s\d+)*$/.test(trimmedPhoneNumber)) {
        setPhoneNumberError('Phone number must contain only numbers and spaces, and may start with a +.');
        isValid = false;
    } else {
        setPhoneNumberError('');
        setPhone(null);
    }

    // Validate postal code
    if (!/^(?=.*\d)[A-Za-z\d\s-]+$/.test(trimmedPostalCode)) {
        setPostalCodeError('Postal Code must contain at least 1 number and can contain letters.');
        isValid = false;
    } else {
        setPostalCodeError('');
        setPostalCode(trimmedPostalCode);
    }

    return isValid;
};

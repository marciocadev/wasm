use std::{
    ffi::{c_char, CStr, CString},
    os::raw::c_schar,
};

use rust_lib::add;

#[no_mangle]
pub unsafe extern "C" fn using_add(left: u32, right: u32) -> u32 {
    add(left, right)
}

#[no_mangle]
pub unsafe extern "C" fn get_str_from_using_add(left: u32, right: u32) -> *mut c_schar {
    let result = format!("{} plus {} equals {}", left, right, using_add(left, right));
    let add_string = CString::new(result).unwrap();
    add_string.into_raw()
}

#[no_mangle]
pub unsafe extern "C" fn receive_strings(str1: *const c_char, str2: *const c_char) -> *mut c_schar {
    // Convert raw C strings to Rust &str
    let c_str1 = CStr::from_ptr(str1);
    let c_str2 = CStr::from_ptr(str2);

    let r_str1 = c_str1.to_str().unwrap_or_default();
    let r_str2 = c_str2.to_str().unwrap_or_default();

    // Concatenate the strings
    let result = format!("{}{}", r_str1, r_str2);

    // Convert back to CString and return raw pointer
    CString::new(result).unwrap().into_raw()
}

#[cfg(test)]
mod tests {
    use std::ffi::CStr;

    use super::*;

    #[test]
    fn if_using_add_works() {
        let result = unsafe { using_add(2, 2) };
        assert_eq!(result, 4);
    }

    #[test]
    fn if_get_str_from_using_add_works() {
        let result = unsafe { get_str_from_using_add(1, 2) };
        let result = unsafe { CStr::from_ptr(result) };
        let result = result.to_str().unwrap();
        assert_eq!(result, "1 plus 2 equals 3")
    }

    #[test]
    fn if_receive_strs_works() {
        // Prepare C-style strings
        let c_str1 = CString::new("teste").unwrap();
        let c_str2 = CString::new("123").unwrap();

        // Call the function
        let result_ptr = unsafe { receive_strings(c_str1.as_ptr(), c_str2.as_ptr()) };

        // Convert result back to Rust string
        let result = unsafe { CStr::from_ptr(result_ptr) };
        let result_str = result.to_str().unwrap();

        // Assert the expected result
        assert_eq!(result_str, "teste123");
    }
}

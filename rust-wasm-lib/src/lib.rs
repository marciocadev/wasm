use std::{ffi::CString, os::raw::c_schar};

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
}

import Swal from "sweetalert2"

const toast = Swal.mixin({
    toast:true,
    position: "top-end",
    showConfirmButton: false,
    showCloseButton: true,
    timer: 3000,
    timerProgressBar: true,
})

export const showSuccess = (message: string) => {
    return toast.fire({
        icon:"success",
        title: message
    })
}

export const showError = (message: string) => {
    return toast.fire({
        icon: "error",
        title: message,
    });
};

export const showWarning = (message: string) => {
    return toast.fire({
        icon: "warning",
        title: message,
    });
};
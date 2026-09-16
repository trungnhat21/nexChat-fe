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

export const confirmDelete = async (
    title = "Bạn có chắc muốn xoá ?"
) => {

    const result = await Swal.fire({
        icon: "warning",
        title,
        text: "Hành động này không thể hoàn tác",
        showCancelButton: true,
        confirmButtonText: "Xoá",
        cancelButtonText: "Huỷ",
    });

    return result.isConfirmed;
};
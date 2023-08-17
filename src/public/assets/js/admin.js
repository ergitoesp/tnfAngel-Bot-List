async function approve(id, username) {
    await Swal.fire({
        title: `Aprobar ${username}`,
        html: `Seguro que quieres aprobar el bot <u>${username}?</u>`,
        showCancelButton: true,
        confirmButtonText: `Aprobar`,
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            let body = await fetch(`/api/admin/approve/${id}`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' }
            });
            body = await body.json();
            if (body.success) location.reload()
            else Swal.showValidationMessage(body.message)
        }
    })
    location.reload()
}

async function deny(id, username) {
    await Swal.fire({
        title: `Rechazar ${username}`,
        html: `Pon una razon para rechazar el bot <u>${username}</u>`,
        showCancelButton: true,
        input: "text",
        confirmButtonText: `Rechazar`,
        showLoaderOnConfirm: true,
        preConfirm: async (reason) => {
            let body = await fetch(`/api/admin/deny/${id}`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({reason})
            });
            body = await body.json();
            if (body.success) location.reload()
            else Swal.showValidationMessage(body.message)
        }
    })
    location.reload()
}
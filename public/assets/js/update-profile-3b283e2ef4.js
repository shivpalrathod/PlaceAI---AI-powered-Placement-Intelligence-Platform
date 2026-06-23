try {

    const showNotification = (type, text) => {
        let options = {};

        options[type] = {
            theme: type === "error" ? "sunset" : "relax",
            text: text,
            type: type,
            layout: "topRight",
            progressBar: true,
            closeWith: ["click", "button"],
            timeout: 6000,
            sounds: {
                sources: ["/storage/sounds/Ting.mp3"],
                volume: 0.5,
                conditions: ["docHidden", "docVisible"]
            }
        };

        new Noty(options[type]).show();
    };

    document.addEventListener("DOMContentLoaded", () => {

        const imageInput = document.querySelector("input.image");
        const submitBtn = document.querySelector(".submit-btn");
        const form = document.querySelector("form");

        if (!submitBtn || !form) {
            console.log("Submit button or form not found");
            return;
        }

        submitBtn.addEventListener("click", (event) => {

            event.preventDefault();

            const nameField = document.querySelector("#name");
            const emailField = document.querySelector("#email");
            const passwordField = document.querySelector("#password");

            const name = nameField ? nameField.value.trim() : "";
            const email = emailField ? emailField.value.trim() : "";
            const password = passwordField ? passwordField.value.trim() : "";

            const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

            console.log("Button clicked");

            if (!name) {
                return showNotification("error", "Name is Required ❌");
            }

            if (!email) {
                return showNotification("error", "Email is Required ❌");
            }

            if (!password) {
                return showNotification("error", "Password is Required ❌");
            }

            if (name.length < 3) {
                return showNotification("error", "Name must be at least 3 Characters Long ❌");
            }

            if (password.length < 6) {
                return showNotification("error", "Password must be at least 6 Characters Long ❌");
            }

            if (!emailRegex.test(email)) {
                return showNotification("error", "Invalid Email Address ❌");
            }

            if (imageInput && imageInput.files.length > 0) {

                const file = imageInput.files[0];

                if (file.size > 3145728) {
                    return showNotification("error", "Image size must be less than 3MB ❌");
                }

                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/jpg",
                    "image/gif",
                    "image/svg+xml"
                ];

                if (!allowedTypes.includes(file.type)) {
                    return showNotification(
                        "error",
                        "Image must be jpeg, png, jpg, gif or svg ❌"
                    );
                }
            }

            console.log("Submitting form...");
            form.submit();
        });
    });

} catch (error) {
    console.error("Profile Update Error:", error);
}
import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Input from "../utils/Input";
import Checkbox from "../utils/Checkbox";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { registerAPI } from "../api/auth";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSignIn } from "react-auth-kit";
import { usePermify } from "@permify/react-role";


export default function RegisterPage() {
    const { getValues, register, handleSubmit, formState: { errors } } = useForm()

    const navigate = useNavigate();
    const signIn = useSignIn();
    const { setUser } = usePermify();

    async function onSubmit(data) {
        // call register api function 
        const response = await registerAPI({
            first_name: data['first-name'],
            last_name: data['last-name'],
            email: data['email'],
            password: data['password'],
            project: data['project-name']
        })

        console.log(response);
        if (response.status === 'success') {
            setUser({
                id: response.response.user.email,
                roles: response.response.user.roles.map(role => role.name),
                permissions: response.response.user.roles.map(role => role.name)
            });

            signIn({
                token: response.response.token,
                expiresIn: 131400,
                tokenType: "Bearer",
                authState: response.response.user
            });

            navigate('/onboarding');
        } else {
            toast.error(response.message);
        }

        
    }

    function isConfirmEmailSame() {
        const email = getValues('email')
        const confirmEmail = getValues('confirm-email')

        return email === confirmEmail
    }

    function isConfirmPasswordSame() {
        const password = getValues('password')
        const confirmPassword = getValues('confirm-password')

        return password === confirmPassword
    }

    return (
        <main className={`bg-white dark:bg-black`}>
            <Helmet>
                <title>DSS | Registration</title>
            </Helmet>

            <Header />

            <div className="h-screen bg-opacity-0 bg-transparent">

                <section className={`bg-neutral-100 dark:bg-[#202427] my-[55px] md:rounded-[12px] max-w-4xl mx-auto px-[16px] md:px-[105px] py-[60px]`}>
                    <h1 className={`text-[#202427] dark:text-white text-[24px] leading-[29px] font-medium mb-[43px]`}>Sign up your Project Group</h1>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-2 gap-x-[32px] gap-y-[19px] mb-[31px]">
                        <Input
                            name={'project-name'}
                            title={"Name of Project Group"}
                            register={register}
                            getValues={getValues}
                            validations={{ required: true }}
                            error={errors['project-name']}
                            rootClasses={'col-span-2'} />

                        <Input
                            name={'first-name'}
                            title={"Admin first name"}
                            register={register}
                            getValues={getValues}
                            validations={{ required: true }}
                            error={errors['first-name']}
                            rootClasses={'col-span-2 md:col-span-1'} />
                        <Input
                            name={'last-name'}
                            title={"Admin last name"}
                            register={register}
                            getValues={getValues}
                            validations={{ required: true }}
                            error={errors['last-name']}
                            rootClasses={'col-span-2 md:col-span-1'} />

                        <Input
                            name={'email'}
                            title={"Email"}
                            type={'email'}
                            register={register}
                            getValues={getValues}
                            validations={{ required: true, pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ }}
                            error={errors['email']}
                            rootClasses={'col-span-2 md:col-span-1'} />
                        <Input
                            name={'confirm-email'}
                            title={"Confirm email"}
                            type={'email'}
                            register={register}
                            getValues={getValues}
                            validations={{ required: true, pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, validate: isConfirmEmailSame }}
                            error={errors['confirm-email']}
                            rootClasses={'col-span-2 md:col-span-1'} />

                        <Input
                            name={'password'}
                            title={"Password"}
                            type={'password'}
                            register={register}
                            getValues={getValues}
                            validations={{ required: true }}
                            error={errors['password']}
                            rootClasses={'col-span-2 md:col-span-1'} />
                        <Input
                            name={'confirm-password'}
                            title={"Confirm Password"}
                            type={'password'}
                            register={register}
                            getValues={getValues}
                            validations={{ required: true, validate: isConfirmPasswordSame }}
                            error={errors['confirm-password']}
                            rootClasses={'col-span-2 md:col-span-1'} />
                    </div>

                    <Checkbox
                        rootClasses={'col-span-2 mb-[75px]'}
                        name={'terms-agree'}
                        register={register}
                        getValues={getValues}
                        validations={{ required: true }}
                        error={errors['terms-agree']}
                    >
                        Yes, I agree to the <span className="underline">Terms of Service</span> and <span className="underline">Privacy policy</span>
                    </Checkbox>

                    <button type="submit" className="ml-auto flex bg-[#0071FF] rounded-full px-[32px] py-[15px] text-white text-[16px] leading-[18px] font-medium">
                        Sign Up
                    </button>
                </form>
            </section>
            </div>

        </main>
    )

}
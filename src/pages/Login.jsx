import { Helmet } from "react-helmet";
import Header from "../components/Header";
import Input from "../utils/Input";
import Checkbox from "../utils/Checkbox";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginAPI } from "../api/auth";
import { CgSpinner } from "react-icons/cg";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSignIn } from "react-auth-kit";
import { usePermify } from '@permify/react-role';
import { useTheme } from "../context/ThemeContext";


export default function LoginPage() {
    const { getValues, register, handleSubmit, formState: { errors } } = useForm()

    const [submitButtonStatus, setSubmitButtonStatus] = useState(null)

    const navigate = useNavigate();
    const signIn = useSignIn();
    const { setUser } = usePermify();


    async function onSubmit(data) {
        setSubmitButtonStatus('loading');

        const response = await loginAPI({
            email: data['email'],
            password: data['password']
        });

        if (response.status === 'success') {
            console.log(response.response.user.roles);
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

            setSubmitButtonStatus(null);
            if (
                !response.response.user.experience ||
                !response.response.user.association ||
                !response.response.user.initiation
            ) {
                navigate('/onboarding');
            } else {
                navigate('/');
            }
        } else {
            setSubmitButtonStatus(null);
            toast.error(response.message);
        }
    }

    return (
        <main>
            <Helmet>
                <title>DSS | Registration</title>
            </Helmet>

            <Header />

            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />

            <div className="h-screen bg-opacity-0 bg-transparent">

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">

                    <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
                        <h1 className={`text-[#202427] dark:text-white text-[24px] leading-[29px] font-medium mb-[43px]`}>Sign in</h1>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-y-[19px] mb-[31px]">

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
                                    name={'password'}
                                    title={"Password"}
                                    type={'password'}
                                    register={register}
                                    getValues={getValues}
                                    validations={{ required: true }}
                                    error={errors['password']}
                                    rootClasses={'col-span-2 md:col-span-1'} />
                            </div>

                            <button type="submit" className="ml-auto flex bg-[#0071FF] rounded-full px-[32px] py-[15px] text-white text-[16px] leading-[18px] font-medium">
                                {
                                    submitButtonStatus === 'loading' ? (
                                        <CgSpinner className="animate-spin" />
                                    ) : 'Login'
                                }
                            </button>
                        </form>
                    </div>
                </div>
            </div>

        </main >
    )

}
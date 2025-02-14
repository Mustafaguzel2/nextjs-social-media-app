/* eslint-disable @typescript-eslint/no-unused-vars */
import { Input } from "./ui/input";
import { InputProps } from "./ui/input";
import React from "react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        return (
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    className={cn("pe-10", className)}
                    ref={ref}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-muted-foreground"
                >
                    {showPassword ? (<EyeOpenIcon className="h-4 w-4" />) : (<EyeClosedIcon className="h-4 w-4" />)}
                </button>

            </div>
        )
    }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };

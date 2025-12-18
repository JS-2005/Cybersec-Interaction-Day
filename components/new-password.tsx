import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export function NewPassword({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-center p-6">
                        <div className="rounded-xl overflow-hidden">
                            <Image src="/cybersec_icon.png" alt="cybersec-icon" loading="eager" width={150} height={150} />
                        </div>
                    </div>
                    <CardTitle>Enter your new password</CardTitle>
                    <CardDescription>
                        Enter a new password for your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                                <Input id="newPassword" type="password" required />
                            </Field>
                            <Field>
                                <Button type="submit">Reset Password</Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
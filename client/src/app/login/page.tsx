import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "@/components/LoginForm";
import RouteProtector from "@/components/RouteProtector";

const Login = () => {
  return (
    <RouteProtector authRequired={false}>
      <MaxWidthWrapper>
        <div className="w-full h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <Card className="w-[450px]">
            <CardHeader>
              <CardTitle className="font-semibold text-purple-500 text-3xl">
                Sign in
              </CardTitle>
              <CardDescription className="text-lg">
                Please sign in to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </MaxWidthWrapper>
    </RouteProtector>
  );
};

export default Login;

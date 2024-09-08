import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import RouteProtector from "@/components/RouteProtector";
import SignupForm from "@/components/SignupForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Signup = () => {
  return (
    <RouteProtector authRequired={false}>
      <MaxWidthWrapper>
        <div className="w-full h-[calc(100vh-3.5rem)] flex items-center justify-center">
          <Card className="w-[450px]">
            <CardHeader>
              <CardTitle className="font-semibold text-purple-500 text-3xl">
                Sign Up
              </CardTitle>
              <CardDescription className="text-lg">
                Create your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm />
            </CardContent>
          </Card>
        </div>
      </MaxWidthWrapper>
    </RouteProtector>
  );
};

export default Signup;

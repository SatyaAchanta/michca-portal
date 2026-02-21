const SignInLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card/90 p-6 shadow-xl backdrop-blur sm:p-10">
        {children}
      </div>
    </div>
  );
};

export default SignInLayout;

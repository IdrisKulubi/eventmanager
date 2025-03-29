export type SignInSearchParams = {
  callbackUrl?: string;
  [key: string]: string | undefined;
};

export type SignInPageProps = {
  searchParams: SignInSearchParams;
}; 
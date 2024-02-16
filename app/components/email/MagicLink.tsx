import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components"

export default function MagicLink({
  code,
  magicLink,
}: {
  code: string
  magicLink?: string
}) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>Log in with this magic link</Preview>
        <Body className="bg-white font-sans text-sm text-gray-800">
          <Container className="mx-auto px-3">
            <Container className="my-10">
              <Img
                alt="Wordbrush's Logo"
                height="32"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                width="32"
              />
              <Heading className="text-2xl font-bold ">Login</Heading>
            </Container>
            <Link
              className="text-sm underline"
              href={magicLink}
              target="_blank"
            >
              Click here to log in with this magic link
            </Link>
            <Text className="mb-3.5 mt-6 ">
              Or, copy and paste this temporary login code:
            </Text>
            <code className="inline-block w-11/12 rounded border border-gray-200 bg-gray-100 p-4 font-mono text-base tracking-widest text-gray-800">
              {code}
            </code>
            <Text className="mb-4 mt-3.5 text-gray-400">
              If you didn&apos;t try to login, you can safely ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

MagicLink.PreviewProps = {
  code: "SP4RKL",
  magicLink: "#",
}

import { redirect } from "next/navigation"

export default async function DashboardRedirectPage({
  params,
}: {
  params: Promise<{ cedisId: string }>
}) {
  const { cedisId } = await params
  redirect(`/${cedisId}`)
}

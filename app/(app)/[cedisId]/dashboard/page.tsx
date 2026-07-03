import { redirect } from "next/navigation"

export default function DashboardRedirectPage({
  params,
}: {
  params: { cedisId: string }
}) {
  redirect(`/${params.cedisId}`)
}

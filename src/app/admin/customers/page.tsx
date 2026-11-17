import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { AdminPagination } from "@/components/admin/pagination";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/section";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatPrice, initials } from "@/lib/utils";
import type { RawSearchParams } from "@/lib/catalog-params";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 15;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  await requireAdmin("/admin/customers");
  const raw = await searchParams;

  const q = (first(raw.q) ?? "").trim().slice(0, 80);
  const requestedPage = Number(first(raw.page));
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.min(Math.round(requestedPage), 500))
    : 1;

  const where: Prisma.UserWhereInput = { role: "CUSTOMER" };
  if (q) {
    where.OR = [{ fullName: { contains: q } }, { email: { contains: q } }];
  }

  const total = await db.user.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const [customers, totalCustomers] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        orders: { select: { total: true, orderStatus: true } },
        _count: { select: { wishlist: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const query: Record<string, string> = {};
  if (q) query.q = q;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow">People</p>
        <h1 className="display mt-2 text-[clamp(1.8rem,3.6vw,2.5rem)] leading-[1.05] text-content">
          Customers.
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          {totalCustomers} registered customer
          {totalCustomers === 1 ? "" : "s"} · {total} matching this view.
        </p>
      </header>

      <form
        method="get"
        className="flex flex-wrap items-end gap-2.5 rounded-2xl border border-line bg-card/40 p-4"
      >
        <div className="min-w-[200px] flex-1">
          <label
            htmlFor="customer-search"
            className="mb-2 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted"
          >
            Search customers
          </label>
          <Input
            id="customer-search"
            name="q"
            defaultValue={q}
            placeholder="Name or email address"
          />
        </div>
        <button
          type="submit"
          className={buttonVariants({ variant: "secondary", size: "md" })}
        >
          Search
        </button>
        {q ? (
          <Link
            href="/admin/customers"
            className={buttonVariants({ variant: "ghost", size: "md" })}
          >
            Clear
          </Link>
        ) : null}
      </form>

      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers match"
          description="Try another search term. New registrations will appear here automatically."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card/55">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line-soft text-[10px] uppercase tracking-[0.14em] text-subtle">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Joined</th>
                  <th className="px-3 py-3 font-medium">Orders</th>
                  <th className="px-3 py-3 font-medium">Spent</th>
                  <th className="px-3 py-3 font-medium">Wishlist</th>
                  <th className="px-5 py-3 text-right font-medium">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {customers.map((customer) => {
                  const spent = customer.orders
                    .filter((order) => order.orderStatus !== "cancelled")
                    .reduce((sum, order) => sum + order.total, 0);

                  return (
                    <tr key={customer.id} className="text-[12px]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full border border-accent/25 bg-accent/10 text-[10px] font-semibold text-accent-bright">
                            {initials(customer.fullName)}
                          </span>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/customers/${customer.id}`}
                              className="block max-w-[13rem] truncate font-medium text-content transition-colors hover:text-accent-bright"
                            >
                              {customer.fullName}
                            </Link>
                            <p className="max-w-[13rem] truncate text-[10.5px] text-subtle">
                              {customer.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-muted">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-3 py-3.5 tabular-nums text-muted">
                        {customer.orders.length}
                      </td>
                      <td className="px-3 py-3.5 tabular-nums text-content">
                        {formatPrice(spent)}
                      </td>
                      <td className="px-3 py-3.5">
                        <Badge variant="outline">
                          {customer._count.wishlist} saved
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className={buttonVariants({
                            variant: "secondary",
                            size: "sm",
                          })}
                        >
                          View
                          <ArrowRight className="size-3.5" aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdminPagination
        page={safePage}
        pageCount={pageCount}
        basePath="/admin/customers"
        query={query}
      />
    </div>
  );
}

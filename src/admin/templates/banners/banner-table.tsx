import { useState } from "react";
import {
  EllipsisHorizontal,
  ExclamationCircle,
  PencilSquare,
  Spinner,
  Trash,
  PlusMini,
} from "@medusajs/icons";
import {
  Container,
  DropdownMenu,
  Heading,
  IconButton,
  StatusBadge,
  Table,
  Text,
  clx,
  usePrompt,
  Button,
} from "@medusajs/ui";
import {
  Row,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAdminCustomQuery } from "medusa-react";
import { useNavigate, useLocation } from "react-router-dom";
import { BannerStatus, IBanner } from "../../types/banner.interface";
import NewBanner from "./new";

interface ListBannerRes {
  banners: IBanner[];
  count: number;
}

interface ListBannerQuery {
  page: number;
  limit: number;
}
const PAGE_SIZE = 10;
const TABLE_HEIGHT = (PAGE_SIZE + 1) * 48;
export const BannerTable = ({ notify }: { notify: any }) => {
  const [openCreateBanner, setOpenCreateBanner] = useState(false);
  const params: ListBannerQuery = {
    page: 0,
    limit: 20,
  };
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAdminCustomQuery<
    ListBannerQuery,
    ListBannerRes
  >("/banners", ["banners"], params);

  const table = useReactTable<IBanner>({
    data: data?.banners ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  const handleCloseCreateBanner = () => {
    setOpenCreateBanner(false);
  };
  const handleOpenCreateBanners = () => {
    setOpenCreateBanner(true);
  };
  if (isLoading) {
    return (
      <Container
        style={{
          height: TABLE_HEIGHT + 143, // Table height + header height + pagination height
        }}
        className="flex items-center justify-center"
      >
        <Spinner className="text-ui-fg-subtle animate-spin" />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container
        style={{
          height: TABLE_HEIGHT + 143, // Table height + header height + pagination height
        }}
        className="flex items-center justify-center"
      >
        <div className="flex items-center gap-x-2">
          <ExclamationCircle className="text-ui-fg-base" />
          <Text className="text-ui-fg-subtle">
            An error occurred while loading the banners. Try to reload the page
            or try again later.
          </Text>
        </div>
      </Container>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-y-2">
        <Container className="overflow-hidden p-0">
          <div className="flex items-center justify-between px-8 pt-6 pb-4">
            <Heading>Banners</Heading>
            <div className="flex items-center gap-x-2">
              <Button
                variant="secondary"
                size="base"
                onClick={handleOpenCreateBanners}
              >
                <PlusMini width={20} />
                New Banner
              </Button>
            </div>
          </div>
          <div
            style={{
              height: TABLE_HEIGHT,
            }}
          >
            <Table>
              <Table.Header>
                {table.getHeaderGroups().map((headerGroup) => {
                  return (
                    <Table.Row
                      key={headerGroup.id}
                      className="[&_th]:w-1/5 [&_th:last-of-type]:w-[1%]"
                    >
                      {headerGroup.headers.map((header) => {
                        return (
                          <Table.HeaderCell key={header.id}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </Table.HeaderCell>
                        );
                      })}
                    </Table.Row>
                  );
                })}
              </Table.Header>
              <Table.Body className="border-b-0">
                {table.getRowModel().rows.map((row) => (
                  <Table.Row
                    key={row.id}
                    className={clx("cursor-pointer [&_td:last-of-type]:w-[1%]")}
                    onClick={() => {
                      navigate(`/a/banners/${row.original.id}`);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <Table.Cell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          <Table.Pagination
            className={clx({
              "border-ui-border-base border-t":
                data?.banners?.length !== PAGE_SIZE,
            })}
            count={0}
            canNextPage={table.getCanNextPage()}
            canPreviousPage={table.getCanPreviousPage()}
            nextPage={table.nextPage}
            previousPage={table.previousPage}
            pageIndex={table.getState().pagination.pageIndex}
            pageCount={table.getPageCount()}
            pageSize={PAGE_SIZE}
          />
        </Container>
      </div>
      <div className="h-xlarge w-full" />
      {openCreateBanner && (
        <NewBanner onClose={handleCloseCreateBanner} notify={notify} />
      )}
    </div>
  );
};

const columnHelper = createColumnHelper<IBanner>();

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("title", {
    header: "Title",
    cell: (info) => (
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue, row }) => {
      const isActive = getValue() === BannerStatus.ACTIVE;

      const color = isActive ? "green" : "grey";

      const text = isActive ? "Active" : "Inactive";

      return (
        <StatusBadge color={color}>
          <span className="capitalize">{text}</span>
        </StatusBadge>
      );
    },
  }),
  columnHelper.accessor("create_at", {
    header: "Created Date",
    cell: (info) => info.getValue(),
  }),
  columnHelper.display({
    id: "actions",
    cell: (info) => {
      return <PriceListTableRowActions row={info.row} />;
    },
  }),
];

type BannerTableRowProps = {
  row: Row<IBanner>;
};
const PriceListTableRowActions = ({ row }: BannerTableRowProps) => {
  // const { mutateAsync: deleteFn } = useAdminDeletePriceList(row.original.id)
  // const { mutateAsync: updateFn } = useAdminUpdatePriceList(row.original.id)

  const prompt = usePrompt();

  const navigate = useNavigate();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const response = await prompt({
      title: "Are you sure?",
      description: "This will permanently delete the price list",
      verificationText: row.original.title,
    });

    if (!response) {
      return;
    }

    //   return deleteFn(undefined, {
    //     onSuccess: () => {
    //       notification(
    //         "Price list deleted",
    //         `Successfully deleted ${row.original.name}`,
    //         "success"
    //       )
    //     },
    //     onError: (err) => {
    //       notification("An error occurred", getErrorMessage(err), "error")
    //     },
    //   })
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();

    navigate(`/a/pricing/${row.original.id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton variant="transparent">
          <EllipsisHorizontal className="text-ui-fg-subtle" />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={handleNavigate}>
          <PencilSquare className="text-ui-fg-subtle" />
          <span className="ml-2">Edit</span>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onClick={handleDelete}>
          <Trash className="text-ui-fg-subtle" />
          <span className="ml-2">Delete</span>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

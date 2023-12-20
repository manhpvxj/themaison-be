import { XMark } from "@medusajs/icons";
import { Button, IconButton, Select } from "@medusajs/ui";
import { useAdminCustomPost } from "medusa-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import InputField from "../../../atoms/input";
import TextArea from "../../../atoms/textarea";
import MediaForm from "../../../components/media-form";
import {
  BannerStatus,
  NewBannerForm,
  UploadRes,
} from "../../../types/banner.interface";
import { FormImage } from "../../../types/shared";

const NewBanner = ({
  onClose,
  notify,
}: {
  onClose: () => void;
  notify: any;
}) => {
  const form = useForm<NewBannerForm>({
    defaultValues: createBlank(),
  });

  const {
    handleSubmit,
    formState: { isDirty, errors, isSubmitting, isValid },
    getFieldState,
    reset,
    register,
    setValue,
    getValues,
    watch,
    clearErrors,
  } = form;

  useEffect(() => {
    reset(createBlank());
  }, []);

  const { mutate, isLoading } = useAdminCustomPost("/banners", [
    "banners_create",
  ]);

  const { mutateAsync, isLoading: isLoadingUpload } = useAdminCustomPost<
    any,
    UploadRes
  >("/uploads", ["uploads"]);

  const onSubmit = async (data: NewBannerForm) => {
    const payload: {
      title: string;
      description: string;
      status: string;
      images: string[];
    } = {
      title: data.title,
      description: data?.description,
      status: data?.status,
      images: [],
    };
    if (!data.images?.length || data.images?.length < 2) {
      notify.error("Error", "Banner must have at least 2 images");
      return;
    }
    let preppedImages: FormImage[] = [];

    try {
      const images = data.images
        .filter((image) => image.nativeFile)
        .map((image) => image.nativeFile);

      const formData = new FormData();
      images.forEach((image) => {
        formData.append(`files`, image);
      });
      await mutateAsync(formData, {
        onSuccess: ({ uploads }) => {
          preppedImages = uploads;
        },
        onError: (error) => {
          console.log(error);
        },
      });
      // preppedImages = await prepareImages(data.images);
    } catch (error) {
      let errorMessage = "Something went wrong while trying to upload images.";
      const response = (error as any).response as Response;

      if (response?.status === 500) {
        errorMessage =
          errorMessage +
          "You might not have a file service configured. Please contact your administrator";
      }

      notify.error("Error", errorMessage);
      return;
    }
    const urls = preppedImages.map((image) => image.url);

    payload.images = urls;

    mutate(payload, {
      onSuccess: () => {
        notify.success("Success", "Create banner successfully");
        reset();
        onClose();
      },
      onError: (error) => {
        notify.error("Error", error?.message);
      },
    });
  };

  return (
    <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-grey-0 absolute inset-0 z-50 flex flex-col items-center">
        <div className="border-b-grey-20 flex w-full justify-center border-b py-4">
          <div className="medium:w-8/12 flex w-full justify-between px-8">
            <IconButton variant="transparent" onClick={onClose}>
              <XMark />
            </IconButton>
            <Button
              size="base"
              variant="secondary"
              type="submit"
              disabled={!isDirty}
              // onClick={onSubmit}
              isLoading={isSubmitting || isLoading || isLoadingUpload}
            >
              Save
            </Button>
          </div>
        </div>
        <div className="h-full w-full overflow-y-auto px-8 no-scrollbar flex justify-center py-16">
          <div className="small:w-4/5 medium:w-7/12 large:w-6/12 max-w-[700px] flex flex-col gap-4">
            <div className="flex justify-between items-end gap-4">
              <InputField
                label="Title"
                placeholder="Enter Title..."
                required
                name="title"
                {...register("title", {
                  required: "Title is required",
                  minLength: {
                    value: 1,
                    message: "Title must be at least 1 character",
                  },
                })}
                errors={errors.title}
              />
              <div className="flex-1">
                <Select
                  onValueChange={(value) =>
                    setValue("status", value as BannerStatus)
                  }
                  value={watch("status")}
                  name="status"
                  {...register("status", {
                    required: "Status must be required",
                  })}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Status..." />
                  </Select.Trigger>
                  <Select.Content className="z-[9999]">
                    {bannerStatusOption.map((item) => (
                      <Select.Item key={item.value} value={item.value}>
                        {item.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            </div>

            <TextArea
              label="Description"
              placeholder={"Description of banner..."}
              rows={3}
              className="mb-small"
              name="description"
              {...register("description")}
              errors={errors?.description}
            />
            <p className="inter-base-regular text-grey-50">Add banner images</p>
            <MediaForm form={form} />
          </div>
        </div>
      </div>
    </form>
  );
};
const createBlank = (): NewBannerForm => {
  return {
    title: "",
    description: "",
    images: [],
  };
};

const bannerStatusOption = [
  {
    label: "Active",
    value: BannerStatus.ACTIVE,
  },
  {
    label: "Inactive",
    value: BannerStatus.INACTIVE,
  },
];
export default NewBanner;

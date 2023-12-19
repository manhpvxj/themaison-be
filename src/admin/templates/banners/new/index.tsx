import React, { useEffect } from "react";
import { IconButton, Button } from "@medusajs/ui";
import { XMark } from "@medusajs/icons";
import { MediaFormType } from "../../../components/media-form";
import { useForm } from "react-hook-form";
import InputField from "../../../atoms/input";
import FormValidator from "../../../utils/form-validator";
type NewBannerForm = {
  title: string;
  description: string;
  media: MediaFormType;
};

const NewBanner = ({ onClose }: { onClose: () => void }) => {
  const form = useForm<NewBannerForm>({
    defaultValues: createBlank(),
  });

  const {
    handleSubmit,
    formState: { isDirty, errors },
    reset,
    register,
  } = form;

  useEffect(() => {
    reset(createBlank());
  }, []);

  const onSubmit = () => {};

  return (
    <form className="w-full">
      <div className="bg-grey-0 absolute inset-0 z-50 flex flex-col items-center">
        <div className="border-b-grey-20 flex w-full justify-center border-b py-4">
          <div className="medium:w-8/12 flex w-full justify-between px-8">
            <IconButton variant="transparent" onClick={onClose}>
              <XMark />
            </IconButton>
            <Button
              size="base"
              variant="secondary"
              type="button"
              disabled={!isDirty}
              onClick={() => {}}
            >
              Save
            </Button>
          </div>
        </div>
        <div className="h-full w-full overflow-y-auto px-8 no-scrollbar flex justify-center py-16">
          <div className="small:w-4/5 medium:w-7/12 large:w-6/12 max-w-[700px]">
            <div>
              <InputField
                label="Title"
                placeholder="Enter Title..."
                required
                {...register("title", {
                  required: "Title is required",
                  minLength: {
                    value: 1,
                    message: "Title must be at least 1 character",
                  },
                  pattern: FormValidator.whiteSpaceRule("Title"),
                })}
                errors={errors.title}
              />
            </div>
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
    media: {
      images: [],
    },
  };
};
export default NewBanner;

import clsx from "clsx";
import { useMemo } from "react";
import {
  Controller,
  FieldArrayWithId,
  useFieldArray,
  useWatch,
  UseFormReturn,
} from "react-hook-form";
import FileUploadField from "../../atoms/file-upload-field";
import { Button } from "@medusajs/ui";
import { Trash, CheckCircleMiniSolid } from "@medusajs/icons";
import { NestedForm } from "../../utils/nested-form";
import Actionables, { ActionType } from "../../atoms/actionables";
import { NewBannerForm } from "../../types/banner.interface";

type Props = {
  form: UseFormReturn<NewBannerForm>;
};

const MediaForm = ({ form }: Props) => {
  const { control, setValue } = form;

  const { fields, append, remove } = useFieldArray({
    control: control,
    name: "images",
  });

  const handleFilesChosen = (files: File[]) => {
    if (files.length) {
      const toAppend = files.map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        nativeFile: file,
        selected: false,
      }));

      append(toAppend);
    }
  };

  const images = useWatch({
    control,
    name: "images",
    defaultValue: [],
  });

  const selected = useMemo(() => {
    const selected: number[] = [];

    images.forEach((i, index) => {
      if (i.selected) {
        selected.push(index);
      }
    });

    return selected;
  }, [images]);

  const handleRemove = () => {
    remove(selected);
  };

  const handleDeselect = () => {
    selected.forEach((i) => {
      setValue(`images.${i}.selected`, false);
    });
  };

  return (
    <div>
      <div>
        <div>
          <FileUploadField
            onFileChosen={handleFilesChosen}
            placeholder="1200 x 1600 (3:4) recommended, up to 10MB each"
            multiple
            filetypes={["image/gif", "image/jpeg", "image/png", "image/webp"]}
            className="py-large"
          />
        </div>
      </div>
      {fields.length > 0 && (
        <div className="mt-large">
          <div className="mb-small flex items-center justify-between">
            <h2 className="inter-large-semibold">Uploads</h2>
            <ModalActions
              number={selected.length}
              onDeselect={handleDeselect}
              onRemove={handleRemove}
            />
          </div>
          <div className="gap-y-2xsmall flex flex-col">
            {fields.map((field, index) => {
              return (
                <Image
                  key={field.id}
                  image={field}
                  index={index}
                  remove={remove}
                  form={form}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

type ImageProps = {
  image: FieldArrayWithId<NewBannerForm, "images", "id">;
  index: number;
  remove: (index: number) => void;
  form: UseFormReturn<NewBannerForm>;
};

const Image = ({ image, index, form, remove }: ImageProps) => {
  const { control } = form;

  const actions: ActionType[] = [
    {
      label: "Delete",
      onClick: () => remove(index),
      icon: <Trash width={20} />,
      variant: "danger",
    },
  ];

  return (
    <Controller
      name={`images.${index}.selected`}
      control={control}
      render={({ field: { value, onChange } }) => {
        return (
          <div className="relative">
            <button
              className={clsx(
                "px-base py-xsmall hover:bg-grey-5 rounded-rounded group flex items-center justify-between",
                {
                  "bg-grey-5": value,
                }
              )}
              type="button"
              onClick={() => onChange(!value)}
            >
              <div className="gap-x-large flex items-center">
                <div className="flex h-16 w-16 items-center justify-center">
                  <img
                    src={image.url}
                    alt={image.name || "Uploaded image"}
                    className="rounded-rounded max-h-[64px] max-w-[64px]"
                  />
                </div>
                <div className="inter-small-regular flex flex-col text-left">
                  <p>{image.name}</p>
                  <p className="text-grey-50">
                    {image.size ? `${(image.size / 1024).toFixed(2)} KB` : ""}
                  </p>
                </div>
              </div>
              <div className="gap-x-base flex items-center">
                <span
                  className={clsx("hidden", {
                    "!text-violet-60 !block": value,
                  })}
                >
                  <CheckCircleMiniSolid width={24} />
                </span>
              </div>
            </button>
            <div className="right-base absolute top-0 bottom-0 flex items-center">
              <Actionables actions={actions} forceDropdown />
            </div>
          </div>
        );
      }}
    />
  );
};

type ModalActionsProps = {
  number: number;
  onRemove: () => void;
  onDeselect: () => void;
};

const ModalActions = ({ number, onRemove, onDeselect }: ModalActionsProps) => {
  return (
    <div className="flex h-10 items-center overflow-y-hidden pr-1">
      <div
        className={clsx(
          "gap-x-small flex items-center transition-all duration-200",
          {
            "translate-y-[-42px]": !number,
            "translate-y-[0px]": number,
          }
        )}
      >
        <span>{number} selected</span>
        <div className="bg-grey-20 h-5 w-px" />
        <div className="gap-x-xsmall flex items-center">
          <Button
            variant="secondary"
            size="base"
            type="button"
            onClick={onDeselect}
          >
            Deselect
          </Button>
          <Button variant="danger" size="base" type="button" onClick={onRemove}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MediaForm;

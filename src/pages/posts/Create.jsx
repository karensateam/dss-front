// @ts-ignore: Workaround for CJS
import { createReactEditorJS } from 'react-editor-js/dist/react-editor-js.cjs';
import Image from '@editorjs/image';
import Embed from '@editorjs/embed';
import List from '@editorjs/list';
import Warning from '@editorjs/warning';
import Table from '@editorjs/table';
import DragDrop from 'editorjs-drag-drop';
import ToggleBlock from 'editorjs-toggle-block';
import Paragraph from "@editorjs/paragraph";
import TextVariantTune from "@editorjs/text-variant-tune";
import Raw from "@editorjs/raw";
import LinkTool from '@editorjs/link';
import header from '@editorjs/header';

import React, { useRef, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { createPostApi, updatePostApi, getPostByIdApi, getPostsApi } from "../../api/post";
import Select from 'react-select';
import Creatable, { useCreatable } from 'react-select/creatable';
import { createTagApi, getTagsApi } from "../../api/tag";

import { APIUploadFile } from "../../api/uploader";
import { getUserPostsApi } from "../../api/userPost";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router";
import { usePermify } from '@permify/react-role';

export default function PostCreatePage() {
  const { isAuthorized, isLoading } = usePermify();

  const { isLightMode } = useTheme();
  const navigate = useNavigate();
  const { getValues, register, handleSubmit, formState: { errors } } = useForm()
  const authHeader = useAuthHeader();
  const [tagOptions, setTagOptions] = useState([]);
  const [selectedTag, setSelectedTag] = useState([]);
  const [isTagLoading, setIsTagLoading] = useState(false);
  const [parentOptions, setParentOptions] = useState([]);
  const [relatedOptions, setRelatedOptions] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedRelated, setSelectedRelated] = useState(null);

  const ReactEditorJS = createReactEditorJS();
  const [editorData, setEditorData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!await isAuthorized(["admin", "super-admin"], [])) {
        navigate('/')
      };
      
      try {
        const tagResponse = await getTagsApi(authHeader());
        if (tagResponse.status === "success") {
          const tagOptions = tagResponse.response.tags.map((tag) => ({
            value: tag.id.toString(),
            label: tag.name,
          }));
          setTagOptions(tagOptions);
        } else {
          console.error("Error fetching tag options:", tagResponse);
          toast.error(tagResponse.message);
        }

        const parentResponse = await getUserPostsApi(authHeader());
        const relatedResponse = await getPostsApi(authHeader());
        if (parentResponse.status === "success") {
          // extract children posts to flat 
          const allParentPosts = [...parentResponse.response.posts];
          const parentOptions = allParentPosts.map((post) => ({
            value: post.id.toString(),
            label: post.title,
          }));
          // append all children posts to parent options
          allParentPosts.forEach((post) => {
            if (post.children.length > 0) {
              post.children.forEach((child) => {
                parentOptions.push({
                  value: child.id.toString(),
                  label: child.title,
                });
              });
            }
          });
          setParentOptions(parentOptions);

          const allRelatedPosts = [...relatedResponse.response.posts];
          const relatedOptions = allRelatedPosts.map((post) => ({
            value: post.id.toString(),
            label: post.title,
          }));
          setRelatedOptions(relatedOptions);
        } else {
          console.error("Error fetching parent options:", parentResponse);
          toast.error(parentResponse.message);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const editorCore = useRef(null)

  const handleInitialize = React.useCallback((instance) => {
    editorCore.current = instance
  }, [])

  const handleReady = () => {
    const editor = editorCore.current._editorJS;
    new DragDrop(editor);
  };

  const onSubmit = async (data) => {
    const description = await editorCore.current.save();
    const selectedTagValues = selectedTag?.map((tag) => tag.value);
    const selectedRelatedValues = selectedRelated?.map((related) => related.value);

    const postData = {
      title: data.title,
      priority: data.priority,
      description: JSON.stringify(description),
      parent_id: selectedParent ? selectedParent.value : null,
      related: selectedRelatedValues,
      tags: selectedTagValues,
    };

    try {
      const response = await createPostApi(authHeader(), postData);
      if (response.status === "success") {
        toast.success(response.message);
        navigate('/admin/posts');
      } else {
        console.error("Error creating post:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCreate = async (inputValue) => {
    setIsTagLoading(true);
    const response = await createTagApi(authHeader(), { name: inputValue });
    if (response.status === "success") {
      toast.success(response.message);
      const newTag = {
        value: response.response.tag.id.toString(),
        label: response.response.tag.name,
      };
      setSelectedTag([...selectedTag, newTag]);
      setTagOptions([...tagOptions, newTag]);
      setIsTagLoading(false);
    } else {
      console.error("Error creating tag:", response);
      toast.error(response.message);
    }
  }

  return (
    <>
      <Helmet>
        <title>DSS | Create Post</title>
      </Helmet>

      <Header />

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="h-screen bg-opacity-0 bg-transparent">
        <section className={`my-[55px] md:rounded-[12px] max-w-7xl mx-auto px-[16px] md:px-[105px] py-[60px] bg-neutral-100 shadow border border-white dark:border-neutral-700 text-[#202427] dark:bg-[#202427] dark:text-white`}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap gap-x-4">
            <div className="flex-1">
              <Input
                name={'title'}
                title={"Title"}
                type={'text'}
                register={register}
                getValues={getValues}
              />
            </div>

            <div className="flex-1">
              <Input
                name={'priority'}
                title={"Priority"}
                type={'text'}
                register={register}
                getValues={getValues}
              />
            </div>

            <div className="w-full mt-4 bg-white rounded text-black">
              <ReactEditorJS
                onInitialize={handleInitialize}
                onReady={handleReady}
                value={editorData}
                tunes={TextVariantTune}
                tools={{
                  textVariant: TextVariantTune,
                  raw: Raw,
                  paragraph: {
                    class: Paragraph,
                    inlineToolbar: true,
                    tunes: ['textVariant']
                  },
                  header: {
                    class: header,
                    inlineToolbar: true,
                    config: {
                      placeholder: 'Enter a header',
                      levels: [2, 3, 4],
                      defaultLevel: 3
                    }
                  },
                  Image: {
                    class: Image,
                    inlineToolbar: true,
                    config: {
                      uploader: {
                        uploadByFile(file) {
                          return new Promise(async (resolve, reject) => {
                            try {
                              const response = await APIUploadFile(file);
                              if (response.status === "success") {
                                resolve({
                                  success: 1,
                                  file: {
                                    url: response.response.url,
                                  }
                                });
                              } else {
                                reject(response.message);
                              }
                            } catch (error) {
                              reject(error);
                            }
                          });
                        }
                      }
                    }
                  },
                  embed: Embed,
                  table: Table,
                  warning: Warning,
                  list: {
                    class: List,
                    inlineToolbar: true,
                  },
                  toggle: {
                    class: ToggleBlock,
                    inlineToolbar: true,
                  },
                  linkTool: {
                    class: LinkTool,
                    config: {
                      endpoint: 'http://nbs-dss-api.oppla.eu/api/v1/meta-data', // Your backend endpoint for url data fetching
                    }
                  }
                }}
              />
            </div>

            <div className="flex-1 mt-4">
              <Creatable
                defaultValue={selectedTag}
                value={selectedTag}
                onChange={setSelectedTag}
                options={tagOptions}
                isLoading={isTagLoading}
                isClearable={true}
                onCreateOption={handleCreate}
                isMulti
                className={`${isLightMode ? 'dark-multi-select' : 'basic-multi-select'}`}
                classNamePrefix={`${isLightMode ? 'light-select' : 'dark-select'}`}
                placeholder={<div>Tags</div>}
              />
            </div>

            <div className="flex-1 mt-4">
              <Select
                defaultValue={selectedParent}
                onChange={(selectedOption) => setSelectedParent(selectedOption)}
                options={parentOptions}
                className={`${isLightMode ? 'dark-multi-select' : 'basic-multi-select'}`}
                classNamePrefix={`${isLightMode ? 'light-select' : 'dark-select'}`}
                placeholder={<div>Parent</div>}
              />
            </div>

            <div className="flex-1 mt-4">
              <Select
                defaultValue={selectedRelated}
                onChange={setSelectedRelated}
                options={relatedOptions}
                isClearable={true}
                isMulti
                className={`${isLightMode ? 'dark-multi-select' : 'basic-multi-select'}`}
                classNamePrefix={`${isLightMode ? 'light-select' : 'dark-select'}`}
                placeholder={<div>Related</div>}
              />
            </div>

            <div className="w-full mt-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full"
              >
                Save
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}

import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import Input from "../../utils/Input";
import { useAuthHeader } from "react-auth-kit";
import { createTagApi, deleteTagApi, getTagByIdApi, getTagsApi, updateTagApi } from "../../api/tag";
import { Link } from "react-router-dom";
import { CgMathPlus } from "react-icons/cg";
import { useTheme } from "../../context/ThemeContext";

export default function TagIndexPage() {
  const authHeader = useAuthHeader();
  const [tags, setTags] = useState([]);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tagIdToDelete, setTagIdToDelete] = useState(null);

  useEffect(() => {
    fetchPostsData();
  }, []);


  const fetchPostsData = async () => {
    try {
      const response = await getTagsApi(authHeader());
      if (response.status === "success") {
        setTags(response.response.tags);
      } else {
        console.error("Error fetching post data:", response);
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching post data:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (tagIdToDelete) {
      const response = await deleteTagApi(authHeader(), tagIdToDelete);
      if (response.status === "success") {
        setTags((prevTags) => prevTags.filter((tag) => tag.id !== tagIdToDelete));
        toast.success(response.message);
      } else {
        console.error("Error deleting post:", response);
        toast.error(response.message);
      }
    }
    setShowConfirmation(false);
  };

  const handleDeleteClick = (tagId) => {
    setTagIdToDelete(tagId);
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <Helmet>
        <title>DSS | Tags</title>
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
        <section className={`my-[55px] md:rounded-[12px] max-w-7xl mx-auto px-[16px] md:px-[105px] py-[60px] bg-white text-[#202427] dark:bg-[#202427] dark:text-white`}>
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h1 className={`text-[24px] font-bold text-[#111315] dark:text-[#F9FAFB] mb-3`}>Tags</h1>

              <Link
                to={`/admin/tags/create`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-full bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 text-white"
              >
                <CgMathPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Tag
              </Link>
            </div>

            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-[#111315] ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-900">
                    <thead className="bg-white bg-opacity-5">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-start text-sm font-semibold sm:pl-6">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-start text-sm font-semibold">
                          Slug
                        </th>
                        <th scope="col" className="relative py-3.5 pr-3 pl-4 sm:pl-6">
                          <span className="sr-only">Action</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-900 bg-white bg-opacity-10">
                      {tags.map((tag) => (
                        <tr key={tag.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <p className="font-medium">{tag.name}</p>
                          </td>
                          <td className="whitespace-nowrap py-4 pr-4 pl-3 text-sm sm:pr-6">
                            <p className="font-medium">{tag.slug}</p>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Link
                              to={`/admin/tags/update/${tag.id}`}
                              className="rounded-full bg-yellow-50 px-5 py-1 text-sm font-medium text-yellow-600 shadow-sm hover:bg-yellow-100"
                            >
                              Edit <span className="sr-only">, {tag.name}</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDeleteClick(tag.id)}
                              className="rounded-full bg-red-50 px-4 py-1 text-sm font-medium text-red-600 shadow-sm hover:bg-red-100"
                            >
                              Delete <span className="sr-only">, {tag.name}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {showConfirmation && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity">
                          <div className={`absolute inset-0 opacity-75 bg-gray-900 dark:bg-gray-900`}></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
                        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                          <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 bg-gray-100 dark:bg-gray-900`}>
                            <h3 className="text-lg leading-6 font-medium">Confirm Deletion</h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-400">Are you sure you want to delete this item?</p>
                            </div>
                          </div>
                          <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse bg-gray-200 dark:bg-gray-800`}>
                            <button
                              onClick={handleConfirmDelete}
                              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                              Delete
                            </button>
                            <button
                              onClick={handleCancelDelete}
                              className={`mt-3 w-full inline-flex justify-center rounded-md px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 sm:mt-0 sm:w-auto sm:text-sm`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

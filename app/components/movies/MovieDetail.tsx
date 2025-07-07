'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Movie, Availability, Region, Platform } from '../../../prisma/generated/client';
import Image from 'next/image';

interface MovieDetailProps {
  movie: Movie & {
    availabilities?: (Availability & {
      platform: Platform;
      region: Region;
    })[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export function MovieDetail({ movie, isOpen, onClose }: MovieDetailProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  {movie.posterUrl && (
                    <div className="mx-auto flex h-48 w-auto items-center justify-center sm:mx-0 sm:h-64 sm:w-auto relative">
                      <Image
                        src={movie.posterUrl}
                        alt={movie.titleEn}
                        width={171}
                        height={256}
                        className="h-48 w-auto object-cover sm:h-64"
                        priority
                      />
                    </div>
                  )}
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-gray-900">
                      {movie.titleEn} - Where to Watch
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Released in {movie.year} • {movie.duration} minutes
                      </p>
                      <p className="mt-2 text-sm text-gray-700">{movie.synopsis}</p>
                      <div className="mt-4 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Movie Information</h4>
                          <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Director</dt>
                              <dd className="mt-1 text-sm text-gray-900">{movie.director}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Duration</dt>
                              <dd className="mt-1 text-sm text-gray-900">{movie.duration} minutes</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Japanese Title</dt>
                              <dd className="mt-1 text-sm text-gray-900">{movie.titleJa}</dd>
                            </div>
                          </dl>
                        </div>
                        {movie.availabilities && movie.availabilities.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Where to Watch</h4>
                            <div className="mt-2 space-y-3">
                              {movie.availabilities.map((availability) => (
                                <div
                                  key={availability.id}
                                  className="rounded-lg border border-gray-200 p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {availability.region?.name}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {availability.platform?.name}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {availability.type === 'FREE' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          Free
                                        </span>
                                      )}
                                      {availability.type === 'SUBSCRIPTION' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          Subscription
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {availability.url !== null && (
                                    <button
                                      onClick={() => window.open(availability.url!, '_blank', 'noopener,noreferrer')}
                                      className="mt-2 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none"
                                    >
                                      Visit Link
                                      <span className="ml-1">→</span>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
"use client"

import * as React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface SimpleLightboxProps {
	images: string[]
	index: number
	onClose: () => void
	onPrev: () => void
	onNext: () => void
}

export function SimpleLightbox({ images, index, onClose, onPrev, onNext }: SimpleLightboxProps) {
	React.useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
			if (e.key === 'ArrowLeft') onPrev()
			if (e.key === 'ArrowRight') onNext()
		}
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [onClose, onPrev, onNext])

	if (!images || images.length === 0) return null

	return (
		<div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
			<button aria-label="Close" className="absolute top-4 right-4 text-white" onClick={onClose}>
				<X className="w-6 h-6" />
			</button>
			<button aria-label="Previous" className="absolute left-4 top-1/2 -translate-y-1/2 text-white" onClick={onPrev}>
				<ChevronLeft className="w-8 h-8" />
			</button>
			<div className="max-w-[90vw] max-h-[85vh]">
				<Image
					src={images[index]}
					alt={`Image ${index + 1}`}
					width={1600}
					height={900}
					className="object-contain w-auto h-auto max-w-full max-h-[85vh] rounded"
				/>
				<div className="text-center text-white mt-2 text-sm opacity-80">
					Image {index + 1} of {images.length}
				</div>
			</div>
			<button aria-label="Next" className="absolute right-4 top-1/2 -translate-y-1/2 text-white" onClick={onNext}>
				<ChevronRight className="w-8 h-8" />
			</button>
		</div>
	)
}

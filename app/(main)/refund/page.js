import { ShieldCheck } from 'lucide-react'

export default function RefundPolicy() {
  return (
    <main className="min-h-screen pt-32 pb-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto prose prose-slate prose-lg">
        <h1 className="text-5xl font-black uppercase tracking-tighter italic mb-12">Refund Policy</h1>
        <p className="text-gray-400 font-bold mb-10">Last Updated: April 12, 2026</p>
        
        <div className="space-y-8 text-slate-600 leading-relaxed font-medium">
          <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100 mb-12">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-blue-900 mt-0 flex items-center gap-4 italic tracking-tighter"><ShieldCheck size={28}/> 100% Satisfaction Guarantee</h2>
            <p className="text-blue-800 font-bold mt-4 leading-relaxed">
              For your health and ours, we cannot accept returns on used hygiene products. However, your satisfaction is our priority. If you're not 100% happy with the performance, we'll make it right with a full refund—no need to ship the used items back. 
            </p>
          </div>
          
          <p>We have a 30-day return policy for <span className="underline decoration-slate-300">unopened and unused</span> products, which means you have 30 days after receiving your item to request a return.</p>
          
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mt-12">Eligibility for Returns (Unopened)</h2>
          <p>To be eligible for a return, your item must be in the same condition that you received it, <span className="underline decoration-slate-300">unopened and unused</span>, in its original packaging. You’ll also need the receipt or proof of purchase.</p>
          
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mt-12 text-red-600 underline underline-offset-8 decoration-red-100 decoration-4">Biosecurity & Hygiene Safety</h2>
          <p className="bg-red-50 p-6 rounded-[2rem] border border-red-100 text-red-900 font-bold leading-relaxed">
            Due to the nature of toilet cleaning products, <span className="underline decoration-red-300 uppercase">used clowand wands and opened refills cannot be returned</span> to our facility. This is to protect our team and ensure environmental safety. If you are unsatisfied, please contact us for a "Hassle-Free Refund" without the need for return shipment.
          </p>
          
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mt-12">Damages and issues</h2>
          <p>Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.</p>
          
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mt-12">Exchanges</h2>
          <p>The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.</p>
          
          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mt-12">Refunds</h2>
          <p>We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method. Please remember it can take some time for your bank or credit card company to process and post the refund too.</p>
        </div>
      </div>
    </main>
  )
}

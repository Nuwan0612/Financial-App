
const GenericInvestmentDetail = ({ id, name }: { id: number; name: string }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{name} Details</h1>
      <p>Account ID: {id}</p>
      {/* Add more details and components related to the generic investment account here */}
    </div>
  )
}

export default GenericInvestmentDetail
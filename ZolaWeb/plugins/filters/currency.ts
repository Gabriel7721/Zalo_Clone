const filters = {
  currency(value: any): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  },
}

export default filters

import discord
from discord.ui import Modal, TextInput, View, Button
#=======================================================
class LeaveModal(Modal):

	def __init__(self):
		super().__init__(title="請假資料")
		self.class_input = TextInput(label="班級", placeholder="請輸入你的班級")
		self.name_input = TextInput(label="姓名", placeholder="請輸入你的姓名")
		self.date_input = TextInput(label="日期 範例格式:10/21", placeholder="請輸入請假日期")
		self.reason_input = TextInput(label="請假原因", placeholder="請輸入請假原因")
		self.add_item(self.class_input)
		self.add_item(self.name_input)
		self.add_item(self.reason_input)
		self.add_item(self.date_input)

	async def on_submit(self, interaction: discord.Interaction):
		class_name = self.class_input.value
		student_name = self.name_input.value
		reason = self.reason_input.value
		date = self.date_input.value
		user = await interaction.client.fetch_user(869504103041081387) #傳給社長
		await user.send(f"請假申請\n班級: {class_name}\n姓名: {student_name}\n原因: {reason}\n日期: {date}")

		await interaction.response.send_message("請假申請已提交。", ephemeral=True)

async def send_leave_button(channel):
	button = Button(label="請假", style=discord.ButtonStyle.success)

	async def button_callback(interaction):
		modal = LeaveModal()
		await interaction.response.send_modal(modal)
	button.callback = button_callback
	view = View(timeout=None)
	view.add_item(button)
	await channel.send("點擊下方按鈕進行請假：", view=view)
#=======================================================